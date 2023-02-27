import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { useEditor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { currentNoteIndexState, currentNoteState } from "../utils/Notes";
import { mainTextState, shadowDomState } from "../utils/states";
import Autocomplete from "./Autocomplete";

// TODO:
// - move utils to utils.ts
// - move types to types.ts
// - do error handling
// - implement loading bar
// - implement background script to store notes in chrome storage
// - implement markdown
// - implement latex
// - exports

export default ({
  setIsLoading,
}: {
  setIsLoading(isLoading: boolean): void;
}) => {
  const currentNoteIndex = useRecoilValue(currentNoteIndexState);
  const [currentNote, setCurrentNote] = useRecoilState(currentNoteState);
  const mainText = useRecoilValue(mainTextState);
  const shadowDom = useRecoilValue(shadowDomState);
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Autocomplete.configure({
          context: mainText,
          shadowDom,
          setIsLoading,
        }),
      ],
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
