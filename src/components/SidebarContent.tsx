import {
  ChevronRightIcon,
  DeleteIcon,
  DragHandleIcon,
  EditIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import {
  Container,
  ContainerProps,
  Flex,
  FlexProps,
  IconButton,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useList } from "react-use";

// import Ripples from "react-ripples";

interface ItemProps extends ContainerProps {
  flexProps?: FlexProps;
}

const Item = (props: ItemProps) => {
  return (
    <Container py={5} fontSize={16} {...props}>
      <Flex gap={2} px={5} alignItems="center" {...props.flexProps}>
        {props.children || "Untitled Note"}
      </Flex>
    </Container>
  );
};

const Note = ({ title }: { title: string }) => (
  // TODO: add ripple effect
  // <Ripples>
  <Item _hover={{ bg: "gray.100", cursor: "pointer" }}>
    <DragHandleIcon />
    {title}
    <Spacer />
    <EditIcon _hover={{ cursor: "pointer" }} />
    <DeleteIcon _hover={{ cursor: "pointer" }} />
  </Item>
  // </Ripples>
);

interface NoteType {
  title: string;
}

export default () => {
  const [notes, {}] = useList<NoteType>(
    Array(10).fill({ title: "Untitled Note" })
  );
  return (
    <VStack height="100%" spacing={0}>
      <Item
        paddingY={8}
        colorScheme="cyan"
        maxWidth="none"
        justifyContent="left"
        background="cyan.200"
        px={0}
        flexProps={{ px: 5 }}
      >
        Project 1 notes
        <SearchIcon _hover={{ cursor: "pointer" }} />
      </Item>
      <VStack
        overflowX="hidden"
        overflowY="scroll"
        spacing={0}
        width="100%"
        h="full"
        css={{
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
        }}
      >
        <Container />
        {notes.map(({ title }, i) => (
          <Note title={title} />
        ))}
      </VStack>
    </VStack>
  );
};
