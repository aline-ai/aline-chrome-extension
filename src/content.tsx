// NOTE: Conventions is based on https://github.com/airbnb/javascript/tree/master/react

import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import App from "./App";
import createCache from "@emotion/cache";

import {
  EnvironmentProvider,
  EnvironmentProviderProps,
} from "@chakra-ui/react-env";
import {
  ColorModeProvider,
  ColorModeProviderProps,
  GlobalStyle,
  ThemeProvider,
} from "@chakra-ui/system";
import theme from "./theme";
import { PortalManager } from "@chakra-ui/portal";
import { ChakraProvider } from "@chakra-ui/react";

// // Old Solution:
// TODO: check if window is large enough
window.addEventListener("load", () => {
  console.log("Injecting Aline elements...");
  const root = document.createElement("div");
  root.id = "aline-root";
  document.documentElement.appendChild(root);
  createRoot(root).render(<App />);
  console.log("Injected Aline elements.");
});

// const shadowContainer = document.createElement("div");
// shadowContainer.id = "shadow-container";
// const shadowRoot = shadowContainer.attachShadow({ mode: "open" });
// const root = document.createElement("main");
// root.id = "aline-root";
// document.documentElement.appendChild(shadowContainer);
// shadowRoot.appendChild(root);
// const myCache = createCache({
//   // @ts-ignore
//   container: shadowRoot,
//   key: "c",
// });
// ReactDOM.render(
//   // <CacheProvider value={myCache}>

//   // <EnvironmentProvider>
//   //   <ThemeProvider theme={theme}>
//   //     <ColorModeProvider options={theme.config}>
//   //       {/* {resetCSS && <CSSReset />} */}
//   //       <GlobalStyle />
//   //       <App />
//   //     </ColorModeProvider>
//   //   </ThemeProvider>
//   // </EnvironmentProvider>,
//   // <ChakraProvider resetCSS={false} cssVarsRoot=":host" theme={theme}>
//   <ThemeProvider theme={theme}>
//     <App />
//   </ThemeProvider>,
//   // </ChakraProvider>,
//   // </CacheProvider>,
//   // <
//   root
// );

// New Solution:
// console.log("Injecting Aline elements...");
// // Inject root into an iframe so that it doesn't interfere with the page's CSS

// // Create iframe
// const iframe = document.createElement("iframe");
// iframe.id = "aline-iframe";
// iframe.style.display = "fixed";
// iframe.style.height = "100vh";
// iframe.style.width = "100vw";
// iframe.style.border = "none";
// iframe.style.zIndex = "9999";
// document.documentElement.appendChild(iframe);

// iframe.onload = () => {
//   // Inject root into iframe
//   const root = document.createElement("div");
//   root.id = "aline-root";
//   iframe.contentDocument!.body.appendChild(root);
//   createRoot(root).render(<App />);
// };

// console.log("Injected Aline elements.");
