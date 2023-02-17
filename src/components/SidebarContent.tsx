import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  DeleteIcon,
  DragHandleIcon,
  EditIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { Container, HStack, Input, Spacer, VStack } from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  Note,
  currentNoteIndexState,
  notesState,
  currentNoteState,
} from "../Notes";

import ReactQuill from "react-quill";
import Item from "./Item";
import { Delta as DeltaType, Sources } from "quill";
import Quill from "quill";
const Delta = Quill.import("delta");

import katex from "katex";
import "katex/dist/katex.min.css";

// @ts-ignore
window.katex = katex;

import "react-quill/dist/quill.bubble.css";
import "../styles/quill.sass";

// Feature: maybe comments

// import Ripples from "react-ripples";

const IconButtonStyle = {
  p: 1,
  borderRadius: 5,
  _hover: { cursor: "pointer", backgroundColor: "cyan.200" },
  _active: { backgroundColor: "cyan.300" },
};

const NoteListItem = ({
  note,
  index,
  onRename,
  isRenaming,
  unsetFileIndexToRename,
}: {
  note: Note;
  index: number;
  onRename: any;
  isRenaming: boolean;
  unsetFileIndexToRename: any;
}) => {
  const [notes, setNotes] = useRecoilState(notesState);
  const [_, setCurrentNoteIndex] = useRecoilState(currentNoteIndexState);
  const [currentNote, setCurrentNote] = useRecoilState(currentNoteState);
  return (
    // TODO: add ripple effect
    // <Ripples>
    <Item
      _hover={{ bg: "gray.100", cursor: "pointer" }}
      onClick={() => {
        if (!isRenaming) setCurrentNoteIndex(index);
      }}
    >
      <DragHandleIcon />
      {isRenaming ? (
        <Input
          height="fit-content"
          fontFamily="body"
          variant="unstyled"
          border="none"
          p={0}
          defaultValue={note.title}
          onKeyPress={(e) => {
            if (e.key == "Enter") {
              // Can be optimized
              setCurrentNote({
                ...currentNote!,
                title: (e.target as HTMLTextAreaElement).value,
              });
              unsetFileIndexToRename();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onBlur={unsetFileIndexToRename}
          autoFocus={true}
        />
      ) : (
        note.title
      )}
      <Spacer />
      <HStack spacing={0}>
        <EditIcon
          {...IconButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
        />
        <DeleteIcon
          {...IconButtonStyle}
          onClick={(e) => {
            e.stopPropagation();
            setNotes([...notes.slice(0, index), ...notes.slice(index + 1)]);
          }}
        />
      </HStack>
    </Item>
    // </Ripples>
  );
};

const scrollbarCSS = {
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#F5F5F5",
  },
  "&::-webkit-scrollbar": {
    width: "6px",
    backgroundColor: "#F5F5F5",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "grey",
  },
};

export default () => {
  const [fileIndexToRename, setFileIndexToRename] = useState<number | null>(
    null
  );
  const [notes, setNotes] = useRecoilState(notesState);
  const [currentNoteIndex, setCurrentNoteIndex] = useRecoilState(
    currentNoteIndexState
  );
  // const currentNote = useRecoilValue(currentNoteState);
  const [currentNote, setCurrentNote] = useRecoilState(currentNoteState);

  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    if (quillRef!.current === null) return;
    quillRef.current.focus();
    const editor = quillRef.current.getEditor();
    quillRef.current.setEditorSelection(editor, {
      index: editor.getLength(),
      length: 0,
    });
  });

  return (
    <VStack height="100%" spacing={0}>
      <Item
        paddingY={8}
        colorScheme="cyan"
        maxWidth="none"
        justifyContent="left"
        background="cyan.100"
        px={0}
        flexprops={{ px: 5 }}
        key={0}
      >
        {currentNote === null ? (
          <>
            Project 1 notes <SearchIcon {...IconButtonStyle} />
          </>
        ) : (
          <>
            <ChevronLeftIcon
              {...IconButtonStyle}
              onClick={() => setCurrentNoteIndex(null)}
            />
            {/* {currentNote.title} */}
            <Input
              height="fit-content"
              fontFamily="body"
              variant="unstyled"
              border="none"
              p={0}
              defaultValue={currentNote.title}
              onKeyPress={(e) =>
                setCurrentNote({
                  ...currentNote,
                  title: (e.target as HTMLTextAreaElement).value,
                })
              }
              onClick={(e) => e.stopPropagation()}
            />
          </>
        )}
      </Item>
      {currentNote === null ? (
        <VStack
          overflowX="hidden"
          overflowY="scroll"
          spacing={0}
          width="100%"
          h="full"
          css={scrollbarCSS}
          key={1}
        >
          <Container />
          {notes.map((note, key) => (
            <NoteListItem
              note={note}
              index={key}
              onRename={() => {
                setFileIndexToRename(key);
              }}
              isRenaming={key == fileIndexToRename}
              unsetFileIndexToRename={() => setFileIndexToRename(null)}
              key={key}
            />
          ))}
        </VStack>
      ) : (
        <Container key={1} h="full">
          <ReactQuill
            theme="bubble"
            value={currentNote.content}
            ref={quillRef}
            onChange={(
              _value: string,
              _delta: DeltaType,
              _source: Sources,
              editor: ReactQuill.UnprivilegedEditor
            ) =>
              setCurrentNote({ ...currentNote, content: editor.getContents() })
            }
            style={{ fontFamily: "var(--chakra-fonts-body)" }}
            modules={{
              toolbar: [
                ["bold", "italic", "underline", "strike"],
                ["code-block", "blockquote", "link", "formula"],
                ["background", "color"],
                [
                  { header: 1 },
                  { header: 2 },
                  { list: "ordered" },
                  { list: "bullet" },
                ],
              ],
            }}
            formats={[
              "background",
              "color",
              "code-block",
              "code",
              "bold",
              "italic",
              "underline",
              "strike",
              "header",
              "list",
              "bullet",
              "link",
              "formula",
            ]}
          />
        </Container>
      )}
    </VStack>
  );
};
