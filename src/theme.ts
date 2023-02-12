import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { NoEmitOnErrorsPlugin } from "webpack";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

export default extendTheme({
  config,
  styles: {
    global: {
      body: {
        // Temporary fix for removing global styles
        color: "ignore",
        background: "ignore",
      },
    },
  },
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
});
