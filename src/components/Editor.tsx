import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { useEditor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { currentNoteIndexState, currentNoteState } from "../Notes";
import { mainTextState } from "../states";
import Autocomplete from "./Autocomplete";

// TODO:
// - move utils to utils.ts
// - move types to types.ts
// - implement background script to store notes in chrome storage
// - implement markdown
// - implement latex
// - exports

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
