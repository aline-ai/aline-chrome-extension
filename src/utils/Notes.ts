import { atom, selector } from "recoil";
import { v4 as uuidv4 } from "uuid";

const noteDefault = `
  <h2>Welcome to Aline!</h2>
  <p>Just a few things to get you started:</p>
  <p>Markdown shortcuts make it easy to format the text while typing.</p>
  <p>To test that, start a new line and type <code>#</code> followed by a space to get a heading. Try <code>#</code>, <code>##</code>, <code>###</code>, <code>####</code>, <code>#####</code>, <code>######</code> for different levels.</p>
  <p>Those conventions are called input rules in tiptap. Some of them are enabled by default. Try <code>></code> for blockquotes, <code>*</code>, <code>-</code> or <code>+</code> for bullet lists, or <code>\`foobar\`</code> to highlight code, <code>~~tildes~~</code> to strike text, or <code>==equal signs==</code> to highlight text.
  </p>
  `;

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const NewNote = (
  title: string = "",
  // content: DeltaType = new Delta(),
  content: any = "",
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
      noteDefault
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
