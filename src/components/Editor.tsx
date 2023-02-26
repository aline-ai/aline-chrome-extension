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
  didCauseSelectionUpdate: boolean;
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
      didCauseSelectionUpdate: false,
      didCauseUpdate: false,
      userDidUpdate: true,
      timer: null,
      serviceScriptPort: chrome.runtime.connect({
        name: "autocomplete",
      }),
      didSuggestAutocomplete: false,
    };
  },
  onCreate() {
    this.storage.serviceScriptPort.onMessage.addListener(
      ({ suggestion }: { suggestion: string }) => {
        // const suggestion = "content<br/>more content";
        const selection = this.editor.state.selection;
        console.log(selection);
        // random anchor changes to prevent cursor from moving

        // var json: JSONContent = generateJSON(suggestion, [
        //   StarterKit,
        //   Autocomplete,
        // ]);
        // json!.content!.forEach((v, i) => {
        // console.log(i, v);
        // json[i].marks = [{ type: "autocomplete" }];
        // if (v.marks) {
        //   json[i].marks = v.marks.concat([{ type: "autocomplete" }]);
        // } else {
        //   json[i].marks = [{ type: "autocomplete" }];
        // }
        // });
        // console.log(json);

        // Apply the autocomplete mark to all elements of the json
        this.storage.didSuggestAutocomplete = true;
        this.storage.didCauseUpdate = true;
        this.storage.didCauseSelectionUpdate = true;
        this.editor
          .chain()
          .setTextSelection(selection.head - 1)
          .insertContent(
            suggestion
            // `<autocomplete>${suggestion}</autocomplete>`
            // json
          )
          .setTextSelection(selection.head)
          .run();
        console.log(this.editor.getJSON());
        this.storage.didCauseUpdate = false;
        this.storage.didCauseSelectionUpdate = false;
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
            const cursorIndicator = "CURSOR_INDICATOR";
            this.storage.didCauseUpdate = true;
            this.editor.commands.insertContent(cursorIndicator);
            const html = this.editor.getHTML().split(cursorIndicator)[0];
            console.log(html);
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
    if (
      !this.storage.didCauseSelectionUpdate &&
      this.storage.didSuggestAutocomplete
    ) {
      this.storage.serviceScriptPort.postMessage({ message: "abort" });

      // var [from, to] = getRangeOfMark(this.editor.getJSON(), "autocomplete");
      // if (from == null) return;
      // const selection = this.editor.state.selection;

      this.editor.commands.undo();
      // this.storage.didCauseSelectionUpdate = true;
      // this.storage.didCauseUpdate = true;
      // this.editor
      //   .chain()
      //   .setTextSelection({ from, to })
      //   .deleteSelection()
      //   .setTextSelection(selection)
      //   .run();
      // this.storage.didCauseSelectionUpdate = false;
      // this.storage.didCauseUpdate = false;
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
