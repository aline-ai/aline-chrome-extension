import React from "react";
import { Button } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";

export default function OpenButton() {
  return (
    <Button
      position="fixed"
      colorScheme="cyan"
      zIndex={10000}
      borderRadius="50%"
      fontSize="2rem"
      height={16}
      width={16}
      opacity={0.8}
      marginLeft={10}
      marginTop={10}
      boxShadow="0 5px 5px grey"
      onClick={() => alert("test")}
    >
      <ChevronRightIcon />
    </Button>
  );
}
