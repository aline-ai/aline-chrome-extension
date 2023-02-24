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
import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
  mergeAttributes,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Node } from "@tiptap/core";

import Item from "./Item";

// import katex from "katex";
// import "katex/dist/katex.min.css";

// // @ts-ignore
// window.katex = katex;

// import "react-quill/dist/quill.bubble.css";
// import "../styles/quill.sass";
import { css, Global } from "@emotion/react";

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

const editorContainerStyles = css`
  .editorContainer > div {
    height: 100%;
    overflow-y: scroll;
  }
  .editorContainer .ProseMirror {
    padding: 16px;
    padding-bottom: 0;
    height: 100%;
    outline: none;
    border: none;
    margin-top: -16px;
  }
`;

const Autocomplete = Node.create({
  name: "autocomplete",
  group: "inline",
  content: "inline*",
  inline: true,
  selectable: false,
  atom: true,
  parseHTML() {
    return [{ tag: "autocomplete" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
  addAttributes() {
    return {
      style: { default: "color: grey" },
      class: "autoComplete",
    };
  },
  // addNodeView() {
  //   return ReactNodeViewRenderer(() => (
  //     <NodeViewWrapper
  //       className="autoComplete"
  //       as="span"
  //       style={{ color: "grey" }}
  //     >
  //       {/* test */}
  //       {/* <span style={{ color: "grey" }}>test</span> */}
  //       <NodeViewContent />
  //     </NodeViewWrapper>
  //   ));
  // },
});

export default () => {
  const [fileIndexToRename, setFileIndexToRename] = useState<number | null>(
    null
  );
  const [notes, setNotes] = useRecoilState(notesState);
  const [currentNoteIndex, setCurrentNoteIndex] = useRecoilState(
    currentNoteIndexState
  );
  const [currentNote, setCurrentNote] = useRecoilState(currentNoteState);

  // const [userDidUpdate, setUserDidUpdate] = useState(true);
  const userDidUpdate = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
              editor.commands.insertContent(
                "<autocomplete>content<br/>more content</autocomplete>",
                { updateSelection: false }
              );
            }
          }, 400);
        } else {
          userDidUpdate.current = true;
        }
      },
    },
    [currentNoteIndex]
  );

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
        <Container
          key={1}
          h="full"
          p={0}
          className="editorContainer"
          overflowY="hidden"
        >
          <Global styles={editorContainerStyles} />
          <EditorContent editor={editor} />
        </Container>
      )}
    </VStack>
  );
};
