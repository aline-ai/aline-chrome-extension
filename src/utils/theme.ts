import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { NoEmitOnErrorsPlugin } from "webpack";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

let theme = extendTheme({
  config,
  colors: {
    cyan: {
      50: "#E8F6FC",
      100: "#C0E5F7",
      200: "#97D5F2",
      300: "#6EC4ED",
      400: "#45B4E7",
      500: "#1DA3E2",
      600: "#1782B5",
      700: "#116288",
      800: "#0C415A",
      900: "#06212D",
    },
  },
  fonts: {
    body: `'Literata', 'serif'`,
    heading: `'Literata', 'serif'`,
  },
});

export default theme;
