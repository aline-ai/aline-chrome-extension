import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { Extension, useEditor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  currentNoteIndexState,
  currentNoteState,
  notesPort,
} from "../utils/states";
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

interface APIUpdateOptions {}

interface APIUpdateStorage {
  apiDidCauseUpdate: boolean;
}

const APIUpdate = Extension.create<APIUpdateOptions, APIUpdateStorage>({
  name: "apiUpdate",
  addStorage() {
    return { apiDidCauseUpdate: false };
  },
});

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
          currentNote: currentNote!,
          setCurrentNote: setCurrentNote!,
        }),
        APIUpdate,
      ],
      autofocus: "end",
      content: currentNote === null ? "" : currentNote.content,
      onUpdate: ({ editor }) => {
        if (!editor.storage.apiUpdate.apiDidCauseUpdate) {
          setCurrentNote({
            ...currentNote!,
            content: editor.getHTML(),
          });
        }
      },
    },
    [currentNoteIndex, mainText]
  );
  notesPort.onMessage.addListener(({ message, notes }) => {
    // chrome.runtime.onMessage.addListener(({ message, notes }) => {
    // This should theoretically cause and infinite loop
    // But somehow this is working as expected
    if (
      message === "updateNotes" &&
      editor &&
      notes.content !== notes[currentNoteIndex!].content
    ) {
      editor.storage.apiUpdate.apiDidCauseUpdate = true;
      editor.commands.setContent(notes[currentNoteIndex!].content);
      editor.storage.apiUpdate.apiDidCauseUpdate = false;
    }
  });
  return <EditorContent editor={editor} />;
};
