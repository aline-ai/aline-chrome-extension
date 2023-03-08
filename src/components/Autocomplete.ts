import {
  generateHTML,
  JSONContent,
  Mark,
  mergeAttributes,
} from "@tiptap/react";
import { cursorIndicator, getRangeOfMark, unescapeHTML } from "../utils/utils";
import { Editor } from "@tiptap/core";
import { NewNote, Note } from "../utils/Notes";
import StarterKit from "@tiptap/starter-kit";
import { treeFilter, treeFind, treeMap } from "../utils/tree_utils";

interface AutocompleteOptions {
  HTMLAttributes: Record<string, any>;
  context: string;
  shadowDom: HTMLDivElement | null;
  isLoading: boolean;
  setIsLoading(isLoading: boolean): void;
  currentNote: Note;
  setCurrentNote: (note: Note) => void;
}

interface AutocompleteStorage {
  didCauseUpdate: boolean;
  userDidUpdate: boolean;
  timer: NodeJS.Timeout | null;
  serviceScriptPort: chrome.runtime.Port;
  oldContent: JSONContent;
  isLoading: boolean;
  abort: () => void;
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

const didSuggestAutocomplete = (json: JSONContent): boolean => {
  return (
    treeFind(json, (json) =>
      Boolean(json.marks?.some((mark) => mark.type == "autocomplete"))
    ) != null
  );
};

const processTokens = (tokens: string[], path: Path): void => {
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
      currentNote: NewNote(),
      setCurrentNote: (_note: Note) => {},
    };
  },
  addStorage() {
    return {
      didCauseUpdate: false,
      userDidUpdate: true,
      timer: null,
      serviceScriptPort: chrome.runtime.connect({ name: "autocomplete" }),
      oldContent: {
        type: "content",
        content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
      },
      isLoading: this.options.isLoading,
      abort: () => {},
    };
  },
  onCreate() {
    this.storage.oldContent = this.editor.getJSON();
    this.storage.abort = () => {
      if (this.storage.timer) {
        clearTimeout(this.storage.timer);
      }
      this.storage.timer = null;
      this.storage.serviceScriptPort.postMessage({ abort: true });
      this.options.setIsLoading(false);
      this.storage.isLoading = false;
    };
    this.storage.serviceScriptPort.onMessage.addListener(
      ({ suggestion }: { suggestion: string }) => {
        if (
          this.storage.isLoading &&
          !didSuggestAutocomplete(this.editor.getJSON())
        ) {
          // TODO: deal with anchor types
          this.storage.abort();
          this.options.setIsLoading(false);
          this.storage.isLoading = false;
          this.storage.oldContent = this.editor.getJSON();
          var content = getContentWithCursor(this, "json") as JSONContent;

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
          path = traverse(content)!;

          const tokens = suggestion
            .split(/(<\/?[a-z0-9]+>)/)
            .filter((e) => e.trim() != "");
          console.log(tokens);
          processTokens(tokens, path);
          content = treeFilter(content, (e) => e.text !== "");

          // Apply the autocomplete mark to all elements of the json
          // console.log("Autocomplete.ts: made suggestion");
          this.storage.didCauseUpdate = true;
          const selection = this.editor.state.selection;
          this.editor
            .chain()
            .setContent(content)
            .setTextSelection(selection)
            .run();
          this.storage.didCauseUpdate = false;
        }
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
        if (didSuggestAutocomplete(this.editor.getJSON())) {
          this.storage.abort();
          var [_first, last] = getRangeOfMark(
            this.editor.getJSON(),
            "autocomplete"
          );

          const content = treeMap(this.editor.getJSON(), (obj) => {
            if (obj.marks)
              obj.marks = obj.marks.filter((e) => e.type != "autocomplete");
            return obj;
          });

          // Be careful of infinite loop
          this.options.setCurrentNote({
            ...this.options.currentNote,
            content: generateHTML(content, [StarterKit]),
          });

          this.storage.didCauseUpdate = true;
          const response = this.editor
            .chain()
            .setContent(content)
            .setTextSelection({ from: last, to: last })
            .run();
          this.storage.didCauseUpdate = false;
          return response;
        } else {
          return true;
        }
      },
    };
  },
  onUpdate() {
    // console.log("fired on update");
    if (
      !this.storage.didCauseUpdate &&
      !didSuggestAutocomplete(this.editor.getJSON())
    ) {
      this.storage.abort();
      this.storage.timer = setTimeout(() => {
        // console.log("Autocomplete.ts: on update", document.hidden);
        if (document.hidden) {
          return;
        }
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
          this.options.setIsLoading(true);
          this.storage.isLoading = true;
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
    if (!this.storage.didCauseUpdate) {
      this.storage.abort();

      if (didSuggestAutocomplete(this.editor.getJSON())) {
        this.editor.storage.didCauseUpdate = true;
        this.editor.commands.setContent(this.storage.oldContent);
        this.editor.storage.didCauseUpdate = false;
      }
    }
  },
});
