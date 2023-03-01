// Move the rest of the states in here
import { atom, selector } from "recoil";
import { Note } from "./Notes";

const mainTextState = atom<string>({
  key: "mainTextState",
  default: "",
});

const shadowDomState = atom<HTMLDivElement | null>({
  key: "shadowDomState",
  default: null,
});

// Perhaps make this load at a different time
const notesPort = chrome.runtime.connect({ name: "notes" });

const notesState = atom<Note[]>({
  // give background script the tab id
  key: "notes",
  default: [],
  effects: [
    ({ setSelf, onSet, trigger }) => {
      if (trigger === "get") {
        notesPort.postMessage({ message: "fetch" });
      }
      onSet((notes) => {
        notesPort.postMessage({ message: "updateNotes", notes });
      });
      notesPort.onMessage.addListener(({ message, notes }) => {
        if (message === "updateNotes" || message === "fetch") setSelf(notes);
      });
    },
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
export {
  mainTextState,
  shadowDomState,
  notesPort,
  notesState,
  currentNoteIndexState,
  currentNoteState,
};
