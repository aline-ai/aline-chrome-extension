import React, { useState } from "react";

import { ChakraProvider } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

import Overlay from "./components/Overlay";
import theme from "./theme";
import FloatingButton from "./components/FloatingButton";

// TODO: configure a shadow dom to prevent css conflicts
export default () => {
  const [overlayOn, setOverlayOn] = useState<boolean>(true);
  return (
    <ChakraProvider resetCSS={false} theme={theme}>
      <FloatingButton
        opacity={0.8}
        right={10}
        top={10}
        onClick={() => setOverlayOn(!overlayOn)}
      >
        {overlayOn ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </FloatingButton>
      <Overlay overlayOn={overlayOn} />
    </ChakraProvider>
  );
};
