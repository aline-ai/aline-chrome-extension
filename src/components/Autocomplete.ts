import { JSONContent, Mark, mergeAttributes } from "@tiptap/react";
import { cursorIndicator, getRangeOfMark, unescapeHTML } from "../utils/utils";
import { Editor } from "@tiptap/core";
import { DOMElement } from "react";
import { Plugin, PluginKey } from "@tiptap/pm/state";

interface AutocompleteOptions {
  HTMLAttributes: Record<string, any>;
  context: string;
  shadowDom: HTMLDivElement | null;
  isLoading: boolean;
  setIsLoading(isLoading: boolean): void;
}

interface AutocompleteStorage {
  didCauseUpdate: boolean;
  userDidUpdate: boolean;
  timer: NodeJS.Timeout | null;
  serviceScriptPort: chrome.runtime.Port;
  didSuggestAutocomplete: boolean;
  oldContent: JSONContent;
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

const getContentWithCursor = (
  _this: {
    storage: AutocompleteStorage;
    editor: Editor;
  },
  mode: string
) => {
  // Helper function to get the content with the cursor indicator
  _this.storage.didCauseUpdate = true;
  _this.editor.commands.insertContent(cursorIndicator);
  const html = mode == "html" ? _this.editor.getHTML() : _this.editor.getJSON();
  _this.editor.commands.undo();
  _this.storage.didCauseUpdate = false;
  return html;
};

const treeMap = (
  json: JSONContent,
  f: (json: JSONContent) => JSONContent
): JSONContent => {
  json.content = json.content?.map((json) => treeMap(json, f));
  return f(json);
};

const treeFilter = (
  json: JSONContent,
  f: (json: JSONContent) => boolean
): JSONContent => {
  return {
    ...json,
    content: json.content?.filter(f).map((json) => treeFilter(json, f)),
  };
};

export default Mark.create<AutocompleteOptions, AutocompleteStorage>({
  name: "autocomplete",
  selectable: false,
  spanning: false,
  atom: true,
  addOptions() {
    return {
      HTMLAttributes: {},
      context: "",
      shadowDom: null,
      isLoading: false,
      setIsLoading: (_isLoading: boolean) => {},
    };
  },
  addStorage() {
    return {
      didCauseUpdate: false,
      userDidUpdate: true,
      timer: null,
      serviceScriptPort: chrome.runtime.connect({ name: "autocomplete" }),
      didSuggestAutocomplete: false,
      oldContent: {
        type: "content",
        content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
      },
    };
  },
  onCreate() {
    this.storage.oldContent = this.editor.getJSON();
    this.storage.serviceScriptPort.onMessage.addListener(
      ({ suggestion }: { suggestion: string }) => {
        // TODO: deal with anchor types
        this.storage.didSuggestAutocomplete = true;
        this.storage.oldContent = this.editor.getJSON();
        var contentWithCursor = getContentWithCursor(
          this,
          "json"
        ) as JSONContent;

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
        // if thi
        tokens.forEach((token) => {
          // Deal with links
          token = token.replace("\n", "");
          if (token.startsWith("<")) {
            const tag = token.slice(1, token.length - 1);
            if (tag.startsWith("/")) {
              // close tag
              const tag = token.slice(2, token.length - 1);
              const _type = tagToType[tag];
              if (_type == undefined) {
                return;
              }
              const [index, node] = path.pop()!;
              // assert node == tag
            } else {
              // open tag
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
        contentWithCursor = treeFilter(contentWithCursor, (e) => e.text !== "");

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
      style: { default: "color: grey; user-select: none" },
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
    // console.log("fired on update");
    if (!this.storage.didCauseUpdate) {
      if (this.storage.timer != null) {
        clearTimeout(this.storage.timer);
      }
      this.storage.serviceScriptPort.postMessage({ message: "abort" });
      this.storage.timer = setTimeout(() => {
        const selection = this.editor.state.selection;
        this.storage.timer = null;
        if (selection.anchor == selection.head) {
          const html = getContentWithCursor(this, "html").split(
            cursorIndicator
          )[0];

          var context = this.options.context;
          getFocusedContext: if (this.options.shadowDom) {
            // Can make this more robust
            const shadowRoot: ShadowRoot | null =
                this.options.shadowDom.shadowRoot,
              alineMainText = shadowRoot?.querySelector("#aline-main-text");

            if (shadowRoot == null) {
              console.error("Shadow root is null");
              break getFocusedContext;
            }

            if (alineMainText == null || alineMainText == undefined) {
              console.error("alineMainText is null");
              break getFocusedContext;
            }

            const height = window.innerHeight,
              rect = alineMainText.getBoundingClientRect(),
              x = rect.left * 0.9 + rect.right * 0.1,
              y1 = height * 0.1,
              y2 = height * 0.9;

            var from = shadowRoot.elementFromPoint(x, y1),
              to = shadowRoot.elementFromPoint(x, y2);
            const getContainingAscendant = (
              e: Element | null
            ): Element | null => {
              if (e == null) return null;
              while (e.parentElement != null) {
                if (e.parentElement == alineMainText) return e;
                e = e.parentElement;
              }
              return null;
            };
            from =
              getContainingAscendant(from) || alineMainText.firstElementChild;
            to = getContainingAscendant(to) || alineMainText.lastElementChild;

            if (from && to) {
              // maybe check if this is the right parent
              const elements: Element[] = [];
              let current: Element | null = from;
              if (current.previousElementSibling)
                current = current.previousElementSibling;
              if (to.nextElementSibling) to = to.nextElementSibling;
              while (current && current != to && !current.contains(to)) {
                elements.push(current!);
                current = current.nextElementSibling;
              }
              elements.push(to);
              context = elements.map((e) => e.outerHTML).join("");
            }
          }
          this.storage.serviceScriptPort.postMessage({
            message: "fetch",
            options: {
              body: JSON.stringify({
                url: document.location.href,
                notes: html,
                context,
              }),
            },
          });
        }
      }, 600);
    }
  },
  onSelectionUpdate() {
    // console.log("fired on selection");
    if (!this.storage.didCauseUpdate && this.storage.didSuggestAutocomplete) {
      this.storage.didSuggestAutocomplete = false;
      this.storage.serviceScriptPort.postMessage({ message: "abort" });

      this.editor.storage.didCauseUpdate = true;
      this.editor.commands.setContent(this.storage.oldContent);
      this.editor.storage.didCauseUpdate = false;
    }
  },
});
