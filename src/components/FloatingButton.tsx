import React from "react";
import { Button, ButtonProps } from "@chakra-ui/react";

export default (props: ButtonProps) => {
  return (
    <Button
      position="fixed"
      colorScheme="cyan"
      zIndex={99999}
      borderRadius="50%"
      border="none"
      fontSize="2rem"
      height={12}
      width={12}
      opacity={0.8}
      boxShadow="0 5px 5px grey"
      {...props}
    >
      {props.children}
    </Button>
  );
};
