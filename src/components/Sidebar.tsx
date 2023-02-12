import { Box } from "@chakra-ui/react";
import React from "react";

export default function Sidebar() {
  return (
    // <div>This is a sidebar</div>
    <Box
      height="100vh"
      width="20vw"
      position="fixed"
      zIndex={99999}
      backgroundColor="white"
      boxShadow="0 0 10px grey"
    >
      This is a sidebar
    </Box>
  );
}
