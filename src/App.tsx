import React, { useMemo, useState } from "react";
import { RecoilRoot } from "recoil";

import root from "react-shadow/emotion";
import { ThemeProvider } from "@emotion/react";
import { CSSVars, toCSSVar } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

import Overlay from "./components/Overlay";
import FloatingButton from "./components/FloatingButton";
import theme from "./utils/theme";

export default () => {
  // This uses Shadow DOM to isolate the Chakra UI theme from the rest of the page.
  // Basically, ChakraProvider boils down mainly to Chakra's ThemeProvider
  // and Chakra's ThemeProvider boils down mainly to Emotion's ThemeProvider and CSSVars.
  // react-shadow doesn't immediately support ChakraProvider, but it does support
  // Emotion's ThemeProvider.
  const [overlayOn, setOverlayOn] = useState<boolean>(false);
  const computedTheme = useMemo(() => toCSSVar(theme), [theme]);
  return (
    <root.div>
      <ThemeProvider theme={computedTheme}>
        <CSSVars root={undefined} />
        <RecoilRoot>
          <FloatingButton
            opacity={0.8}
            right={10}
            top={10}
            onClick={() => setOverlayOn(!overlayOn)}
          >
            {overlayOn ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </FloatingButton>
          <Overlay overlayOn={overlayOn} />
        </RecoilRoot>
      </ThemeProvider>
    </root.div>
  );
};
