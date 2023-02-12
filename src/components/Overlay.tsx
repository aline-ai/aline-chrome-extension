import {
  Box,
  Heading,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";

import Sidebar from "./Sidebar";

interface ReaderModeProps {
  on: boolean;
}

export default function ReaderMode(props: ReaderModeProps) {
  return (
    <Box
      position="fixed"
      display="flex"
      height="100vh"
      width="100vw"
      zIndex="9999"
      top={props.on ? 0 : "-100vh"}
      left={0}
      background="white"
      transition="top 0.6s ease-in-out"
    >
      <Sidebar on={props.on} />
      <Box flexGrow={1} padding={20}>
        <Stack maxWidth={600} marginX="auto">
          <Skeleton height="20px" width="200px" />
          {[5, 9, 7, 2, 3].map((i) => (
            <>
              <br />
              <SkeletonText noOfLines={i} spacing="4" skeletonHeight="2" />
            </>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
