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

const notesPort = chrome.runtime.connect({ name: "notes" });

const notesState = atom<Note[]>({
  key: "notes",
  // default: [NewNote("Getting Started", noteDefault)],
  default: [],
  effects: [
    ({ setSelf, onSet, trigger }) => {
      if (trigger === "get") {
        notesPort.postMessage({ message: "fetch" });
      }
      chrome.runtime.onMessage.addListener(({ notes }) => {
        console.log("Received on chrome.runtime");
        setSelf(notes);
      });
      onSet((notes) => {
        console.log("Sending ");
        notesPort.postMessage({ message: "update", notes });
      });
      notesPort.onMessage.addListener(({ notes }) => {
        console.log("Received on notesPort");
        setSelf(notes);
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
