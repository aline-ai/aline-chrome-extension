import React, { useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { JSONContent, Mark, mergeAttributes, useEditor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { currentNoteIndexState, currentNoteState } from "../Notes";

interface AutocompleteOptions {
  HTMLAttributes: Record<string, any>;
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

  const traverse = (json: JSONContent) => {
    if (json.text) {
      if (json.marks?.find((e) => e.type == markType)) {
        if (first == null) first = current;
        last = current + json.text.length;
      }
      current += json.text.length;
    } else {
      current += 1;
    }
    if (json.content) {
      for (let i = 0; i < json.content.length; i++) {
        traverse(json.content[i]);
      }
    }
  };
  traverse(json);
  return [first, last];
};

const Autocomplete = Mark.create<AutocompleteOptions>({
  name: "autocomplete",
  selectable: false,
  spanning: true,
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
        var [first, last] = getRangeOfMark(
          this.editor.getJSON(),
          "autocomplete"
        );

        if (first == null) return true;
        const from = this.editor.state.selection.from,
          to = this.editor.state.selection.from + last! - first;
        console.log("here!");

        return this.editor
          .chain()
          .setTextSelection({ from, to })
          .complete()
          .setTextSelection({ from: to, to })
          .run();
      },
    };
  },
  onSelectionUpdate() {
    var [first, last] = getRangeOfMark(this.editor.getJSON(), "autocomplete");
    console.log(first);

    if (first == null) return true;
    const from = this.editor.state.selection.from,
      to = this.editor.state.selection.from + last! - first;

    return this.editor
      .chain()
      .setTextSelection({ from, to })
      .deleteSelection()
      .run();
  },
});

export default () => {
  const userDidUpdate = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentNoteIndex = useRecoilValue(currentNoteIndexState);
  const [currentNote, setCurrentNote] = useRecoilState(currentNoteState);
  const editor = useEditor(
    {
      extensions: [StarterKit, Autocomplete],
      autofocus: "end",
      content: currentNote === null ? "" : currentNote.content,
      onUpdate: ({ editor }) => {
        setCurrentNote({
          ...currentNote!,
          content: editor.getHTML(),
        });
        if (userDidUpdate.current) {
          if (timerRef.current != null) {
            clearTimeout(timerRef.current);
          }
          timerRef.current = setTimeout(() => {
            const selection = editor.state.selection;
            timerRef.current = null;
            if (selection.anchor == selection.head) {
              userDidUpdate.current = false;
              // random anchor changes to prevent cursor from moving
              editor.commands.setTextSelection(selection.anchor - 1);
              editor.commands.insertContentAt(
                selection.anchor,
                "<autocomplete>content<br/>more content</autocomplete>",
                {
                  updateSelection: false,
                  parseOptions: { preserveWhitespace: true },
                }
              );
              editor.commands.setTextSelection(selection.anchor);
            }
          }, 400);
        } else {
          userDidUpdate.current = true;
        }
      },
    },
    [currentNoteIndex]
  );
  return <EditorContent editor={editor} />;
};
