import { JSONContent, Mark, mergeAttributes } from "@tiptap/react";
import { cursorIndicator, getRangeOfMark, unescapeHTML } from "../utils";

interface AutocompleteOptions {
  HTMLAttributes: Record<string, any>;
  context: string;
}

interface AutocompleteStorage {
  didCauseUpdate: boolean;
  userDidUpdate: boolean;
  timer: NodeJS.Timeout | null;
  serviceScriptPort: chrome.runtime.Port;
  didSuggestAutocomplete: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    autocomplete: {
      /**
       * Complete the autocomplete */
      complete: () => ReturnType;
    };
  }
}

type Path = [number, JSONContent][];

export default Mark.create<AutocompleteOptions, AutocompleteStorage>({
  name: "autocomplete",
  selectable: false,
  spanning: false,
  addOptions() {
    return {
      HTMLAttributes: {},
      context: "",
    };
  },
  addStorage() {
    return {
      didCauseUpdate: false,
      userDidUpdate: true,
      timer: null,
      serviceScriptPort: chrome.runtime.connect({ name: "autocomplete" }),
      didSuggestAutocomplete: false,
    };
  },
  onCreate() {
    this.storage.serviceScriptPort.onMessage.addListener(
      ({ suggestion }: { suggestion: string }) => {
        // TODO: deal with anchor types
        this.storage.didSuggestAutocomplete = true;
        this.storage.didCauseUpdate = true;
        this.editor.commands.insertContent(cursorIndicator);
        const contentWithCursor = this.editor.getJSON();
        this.editor.commands.undo();
        this.storage.didCauseUpdate = false;

        // initializing the path so that it finds the node with the cursorIndicator
        let path: Path = [];
        let indexOfCursor = -1;
        const traverse = (json: JSONContent): Path | null => {
          if (json.text) {
            indexOfCursor = json.text.indexOf(cursorIndicator);
            json.text = json.text.replace(cursorIndicator, "");
            if (indexOfCursor != -1) {
              return [];
            }
          }
          if (json.content) {
            for (let i = 0; i < json.content.length; i++) {
              const result = traverse(json.content[i]);
              if (result != null) {
                return [[i, json], ...result]; // maybe use concat
              }
            }
          }
          return null;
        };
        path = traverse(contentWithCursor)!;
        console.log(path);

        const tokens = suggestion
          .split(/(<\/?[a-z0-9]+>)/)
          .filter((e) => e.trim() != "");
        console.log(tokens);
        const tagToType: { [id: string]: string } = {
          h1: "heading",
          h2: "heading",
          h3: "heading",
          ul: "bulletList",
          ol: "orderedList",
          li: "listItem",
          p: "paragraph",
        };
        tokens.forEach((token) => {
          // console.log(JSON.stringify(path));
          // console.log(token);
          // Deal with links
          token = token.replace("\n", "");
          if (token.startsWith("<")) {
            const tag = token.slice(1, token.length - 1);
            if (tag.startsWith("/")) {
              // close tag
              console.log("close!");
              const tag = token.slice(2, token.length - 1);
              const _type = tagToType[tag];
              if (_type == undefined) {
                return;
              }
              const [index, node] = path.pop()!;
              // assert node == tag
            } else {
              // open tag
              console.log("open!");
              const _type = tagToType[token.slice(1, token.length - 1)];
              if (_type == undefined) {
                return;
              }
              const [index, node] = path[path.length - 1];
              const newObject: JSONContent = {
                type: _type,
                marks: [{ type: "autocomplete" }],
                content: [],
              };
              if (_type == "heading") {
                newObject.attrs = { level: 2 };
              }
              node.content!.splice(index + 1, 0, newObject);
              path[path.length - 1][0] = index + 1;
              path.push([-1, node.content![index + 1]]);
            }
          } else {
            // text
            console.log("text");
            const [index, node] = path[path.length - 1];
            // assert node.text != null
            node.content!.splice(index, 0, {
              type: "text",
              marks: [{ type: "autocomplete" }],
              text: unescapeHTML(token),
            });
            path[path.length - 1][0] = index + 1;
          }
        });
        const filterTree = (json: JSONContent) => {
          json.content = json.content
            ?.filter((e) => e.text !== "")
            .map(filterTree);
          return json;
        };
        filterTree(contentWithCursor);

        // Apply the autocomplete mark to all elements of the json
        this.storage.didCauseUpdate = true;
        const selection = this.editor.state.selection;
        this.editor
          .chain()
          .setContent(contentWithCursor)
          .setTextSelection(selection)
          .run();
        this.storage.didCauseUpdate = false;
      }
    );
  },
  parseHTML() {
    return [{ tag: "autocomplete" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addAttributes() {
    return {
      style: { default: "color: grey" },
      class: "autocomplete",
    };
  },
  addCommands() {
    return {
      complete:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.storage.didSuggestAutocomplete) {
          this.storage.didSuggestAutocomplete = false;
          var [_first, last] = getRangeOfMark(
            this.editor.getJSON(),
            "autocomplete"
          );

          // if (first == null) return true;
          // const from = this.editor.state.selection.from,
          //   to = this.editor.state.selection.from + last! - first;

          const content = this.editor.getJSON();
          // remove the autocomplete mark from the content
          const removeAutocomplete = (json: JSONContent) => {
            json.marks = json.marks?.filter((e) => e.type != "autocomplete");
            json.content = json.content?.map(removeAutocomplete);
            return json;
          };
          removeAutocomplete(content);

          return this.editor
            .chain()
            .setContent(content)
            .setTextSelection({ from: last, to: last })
            .run();
        } else {
          return true;
        }
      },
    };
  },
  onUpdate() {
    if (!this.storage.didCauseUpdate) {
      if (this.storage.timer != null) {
        clearTimeout(this.storage.timer);
      }
      this.storage.serviceScriptPort.postMessage({ message: "abort" });
      this.storage.timer = setTimeout(() => {
        const selection = this.editor.state.selection;
        this.storage.timer = null;
        if (selection.anchor == selection.head) {
          this.storage.timer = setTimeout(() => {
            this.storage.didCauseUpdate = true;
            this.editor.commands.insertContent(cursorIndicator);
            const html = this.editor.getHTML().split(cursorIndicator)[0];
            this.editor.commands.undo();
            console.log(this.editor.getJSON());
            this.storage.didCauseUpdate = false;
            this.storage.serviceScriptPort.postMessage({
              message: "fetch",
              options: {
                method: "POST",
                mode: "cors",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  url: document.location.href,
                  notes: html,
                  context: this.options.context,
                }),
              },
            });
          }, 1000);
        }
      }, 400);
    }
  },
  onSelectionUpdate() {
    if (!this.storage.didCauseUpdate && this.storage.didSuggestAutocomplete) {
      this.storage.serviceScriptPort.postMessage({ message: "abort" });
      this.editor.commands.undo();
      this.storage.didSuggestAutocomplete = false;
    }
  },
});
