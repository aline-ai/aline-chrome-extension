import React, { useMemo, useState } from "react";
import { RecoilRoot } from "recoil";
import root from "react-shadow/emotion";

import { CSSVars, toCSSVar } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

import Overlay from "./components/Overlay";
import theme from "./theme";
import FloatingButton from "./components/FloatingButton";
import { ThemeProvider } from "@emotion/react";

// TODO: configure a shadow dom to prevent css conflicts
export default () => {
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
