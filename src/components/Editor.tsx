import React, { useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import {
  generateHTML,
  generateJSON,
  JSONContent,
  Mark,
  mergeAttributes,
  useEditor,
} from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { currentNoteIndexState, currentNoteState } from "../Notes";
import { mainTextState } from "../states";

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

const getRangeOfMark = (
  json: JSONContent,
  markType: string
): [number | null, number] => {
  // perform a dfs throught the document and find the first and last autocomplete elements
  var first: number | null = null,
    last: number = 0,
    current: number = 0;
  console.log(json);

  const traverse = (json: JSONContent) => {
    if (json.content) {
      current += 1;
    }
    if (json.text) {
      if (json.marks?.find((e) => e.type == markType)) {
        if (first == null) first = current - 1;
        last = current + json.text.length;
      }
      current += json.text.length;
    }
    if (json.content) {
      for (let i = 0; i < json.content.length; i++) {
        traverse(json.content[i]);
      }
      current += 1;
    }
  };
  traverse(json);
  return [first, last];
};

const cursorIndicator = "CURSOR_INDICATOR";

const Autocomplete = Mark.create<AutocompleteOptions, AutocompleteStorage>({
  name: "autocomplete",
  selectable: false,
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
        // const suggestion = "content<br/>more content";
        this.storage.didSuggestAutocomplete = true;
        const selection = this.editor.state.selection;
        // random anchor changes to prevent cursor from moving

        // const content = this.editor.getJSON();
        type Path = [number, JSONContent][];

        this.storage.didCauseUpdate = true;
        this.editor.commands.insertContent(cursorIndicator);
        const contentWithCursor = this.editor.getJSON();
        this.editor.commands.undo();
        this.storage.didCauseUpdate = false;

        console.log(contentWithCursor);

        // initializing the path so that it finds the node with the cursorIndicator
        let path: Path = [];
        let indexOfCursor = -1;
        const traverse = (json: JSONContent): Path | null => {
          if (json.text) {
            indexOfCursor = json.text.indexOf(cursorIndicator);
            json.text = json.text.replace(cursorIndicator, "");
            if (indexOfCursor != -1) {
              // return [[indexOfCursor, json]];
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
          .filter((e) => e != "");
        const tagToType: { [id: string]: string } = {
          h1: "heading",
          h2: "heading",
          h3: "heading",
          ul: "bulletList",
          li: "listItem",
          p: "paragraph",
        };
        tokens.forEach((token) => {
          console.log(JSON.stringify(path));
          console.log(token);
          if (token.startsWith("<")) {
            const tag = token.slice(1, token.length - 1);
            if (tag.startsWith("/")) {
              // close tag
              console.log("close!");
              const tag = token.slice(2, token.length - 1);
              const [index, node] = path.pop()!;
              // path[path.length - 1][0] = index + 1;
              // assert node == tag
              // path[path.length - 1][1].content!.splice(index + 1, 0, {
              //   type: tag,
              //   content: [],
              // });
            } else {
              // open tag
              console.log("open!");
              const _type = tagToType[token.slice(1, token.length - 1)];
              const [index, node] = path[path.length - 1];
              node.content!.splice(index + 1, 0, {
                type: _type,
                attrs: _type == "heading" ? { level: 1 } : undefined,
                content: [],
              });
              path[path.length - 1][0] = index + 1;
              path.push([-1, node.content![index + 1]]);
            }
          } else {
            // text
            // might need serialization
            console.log("text");
            const [index, node] = path[path.length - 1];
            // assert node.text != null
            node.content!.splice(index, 0, {
              type: "text",
              text: token,
            });
            path[path.length - 1][0] = index + 1;
            // if (node.text == "") {
            //   node.text =
            //     node.text.slice(0, index) + token + node.text.slice(index);
            // } else {
            //   node.text = token;
            // }
          }
        });
        console.log(contentWithCursor);

        // Apply the autocomplete mark to all elements of the json
        this.storage.didCauseUpdate = true;
        this.editor.commands.setContent(contentWithCursor);
        // this.editor
        //   .chain()
        //   .setTextSelection(selection.head - 1)
        //   .insertContent(
        //     suggestion
        //     // `<autocomplete>${suggestion}</autocomplete>`
        //     // json
        //   )
        //   .setTextSelection(selection.head)
        //   .run();
        console.log(this.editor.getJSON());
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
          var [first, last] = getRangeOfMark(
            this.editor.getJSON(),
            "autocomplete"
          );

          if (first == null) return true;
          const from = this.editor.state.selection.from,
            to = this.editor.state.selection.from + last! - first;

          return this.editor
            .chain()
            .setTextSelection({ from, to })
            .complete()
            .setTextSelection({ from: to, to })
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

export default () => {
  const currentNoteIndex = useRecoilValue(currentNoteIndexState);
  const [currentNote, setCurrentNote] = useRecoilState(currentNoteState);
  const mainText = useRecoilValue(mainTextState);
  const editor = useEditor(
    {
      extensions: [StarterKit, Autocomplete.configure({ context: mainText })],
      autofocus: "end",
      content: currentNote === null ? "" : currentNote.content,
      onUpdate: ({ editor }) => {
        setCurrentNote({
          ...currentNote!,
          content: editor.getHTML(),
        });
      },
    },
    [currentNoteIndex, mainText]
  );
  return <EditorContent editor={editor} />;
};
