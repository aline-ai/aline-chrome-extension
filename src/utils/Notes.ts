import { generateJSON, HTMLContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { v4 as uuidv4 } from "uuid";
import Autocomplete from "../components/Autocomplete";

const noteDefault = `
  <h2>Welcome to Aline!</h2>
  <p>Just a few things to get you started:</p>
  <p>Markdown shortcuts make it easy to format the text while typing.</p>
  <p>To test that, start a new line and type <code>#</code> followed by a space to get a heading. Try <code>#</code>, <code>##</code>, <code>###</code>, <code>####</code>, <code>#####</code>, <code>######</code> for different levels.</p>
  <p>Those conventions are called input rules in tiptap. Some of them are enabled by default. Try <code>></code> for blockquotes, <code>*</code>, <code>-</code> or <code>+</code> for bullet lists, or <code>\`foobar\`</code> to highlight code, <code>~~tildes~~</code> to strike text, or <code>==equal signs==</code> to highlight text.
  </p>
  `;

const defaultNotes = [
  // fix later
  {
    title: "Getting Started",
    content: noteDefault,
  },
];

// const noteDefaultContent = { type: "doc", content: [{ type: "paragraph" }] };

interface Note {
  id: string;
  title: string;
  // content: JSONContent;
  content: HTMLContent;
  createdAt: number;
  updatedAt: number;
}

const NewNote = (
  title: string = "",
  // content: DeltaType = new Delta(),
  content: HTMLContent = noteDefault,
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

// update browser

export {
  defaultNotes,
  Note,
  // notesPort,
  // notesState,
  // currentNoteIndexState,
  NewNote,
  // currentNoteState,
};
