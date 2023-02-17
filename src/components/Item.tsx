import { Container, ContainerProps, Flex, FlexProps } from "@chakra-ui/react";
import React from "react";

interface ItemProps extends ContainerProps {
  flexprops?: FlexProps; // purposely miscapitalized
}

export default (props: ItemProps) => {
  return (
    <Container py={5} fontSize={16} {...props}>
      <Flex gap={2} px={5} alignItems="center" {...props.flexprops}>
        {props.children || "Untitled Note"}
      </Flex>
    </Container>
  );
};
