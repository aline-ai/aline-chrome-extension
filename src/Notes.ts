import { atom, selector } from "recoil";
import { v4 as uuidv4 } from "uuid";

import { Delta as DeltaType } from "quill";
import Quill from "quill";
const Delta = Quill.import("delta");

interface Note {
  id: string;
  title: string;
  content: DeltaType;
  createdAt: number;
  updatedAt: number;
}

const NewNote = (
  title: string = "",
  content: DeltaType = new Delta(),
  id: string = ""
): Note => {
  return {
    id: id || uuidv4(),
    title: title,
    content: content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

const notesState = atom<Note[]>({
  key: "notes",
  default: [
    NewNote(
      "Getting Started",
      (new Delta() as DeltaType).insert("Welcome to Aline!")
    ),
  ],
});

const currentNoteIndexState = atom<number | null>({
  key: "currentNoteIndex",
  default: null,
});

const currentNoteState = selector({
  key: "currentNote",
  get: ({ get }) => {
    const notes = get(notesState);
    const currentNoteIndex = get(currentNoteIndexState);
    return currentNoteIndex === null ? null : notes[currentNoteIndex];
  },
  set: ({ set, get }, updatedNote) => {
    const notes = get(notesState);
    const currentNoteIndex = get(currentNoteIndexState);
    if (currentNoteIndex === null) return;
    const newNotes = [...notes];
    newNotes[currentNoteIndex!] = updatedNote as Note;
    set(notesState, newNotes);
  },
});

export { Note, notesState, currentNoteIndexState, NewNote, currentNoteState };
