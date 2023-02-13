import { Box, Skeleton, SkeletonText, Stack } from "@chakra-ui/react";
import React, { useEffect } from "react";

import Sidebar from "./Sidebar";

const defaultBoxShadow = "0 5px 10px grey";
export default ({ overlayOn }: { overlayOn: boolean }) => {
  const [boxShadow, setBoxShadow] = React.useState<string>(defaultBoxShadow);
  useEffect(() => {
    if (overlayOn) {
      setBoxShadow(defaultBoxShadow);
    } else {
      setTimeout(() => setBoxShadow("none"), 600);
    }
  }, [overlayOn]);
  return (
    <Box
      position="fixed"
      display="flex"
      height="100vh"
      width="100vw"
      zIndex="9999"
      top={overlayOn ? 0 : "-100vh"}
      left={0}
      background="white"
      boxShadow={boxShadow}
      transition="top 0.6s ease-in-out"
      fontFamily={"body"}
    >
      <Sidebar overlayOn={overlayOn} />
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
};
