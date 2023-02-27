import React, { useEffect, useMemo, useRef, useState } from "react";
import { RecoilRoot, useRecoilState } from "recoil";

import root from "react-shadow/emotion";
import { ThemeProvider } from "@emotion/react";
import { CSSVars, toCSSVar } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

import Overlay from "./components/Overlay";
import FloatingButton from "./components/FloatingButton";
import theme from "./utils/theme";
import { shadowDomState } from "./utils/states";

const InnerApp = () => {
  // This uses Shadow DOM to isolate the Chakra UI theme from the rest of the page.
  // Basically, ChakraProvider boils down mainly to Chakra's ThemeProvider
  // and Chakra's ThemeProvider boils down mainly to Emotion's ThemeProvider and CSSVars.
  // react-shadow doesn't immediately support ChakraProvider, but it does support
  // Emotion's ThemeProvider.
  const [overlayOn, setOverlayOn] = useState<boolean>(false);
  const computedTheme = useMemo(() => toCSSVar(theme), [theme]);
  const [shadowDom, setShadowDom] = useRecoilState<HTMLDivElement | null>(
    shadowDomState
  );
  const shadowDomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    setShadowDom(shadowDomRef.current);
  }, [shadowDomRef.current]);
  return (
    <root.div ref={shadowDomRef}>
      <ThemeProvider theme={computedTheme}>
        <CSSVars root={undefined} />
        <FloatingButton
          opacity={0.8}
          right={10}
          top={10}
          onClick={() => setOverlayOn(!overlayOn)}
        >
          {overlayOn ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </FloatingButton>
        <Overlay overlayOn={overlayOn} />
      </ThemeProvider>
    </root.div>
  );
};

export default () => {
  return (
    <RecoilRoot>
      <InnerApp />
    </RecoilRoot>
  );
};
