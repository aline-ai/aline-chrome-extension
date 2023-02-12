// NOTE: Conventions is based on https://github.com/airbnb/javascript/tree/master/react

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";

import Overlay from "./components/Overlay";
import theme from "./theme";
import FloatingButton from "./components/FloatingButton";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

const App = () => {
  const [on, setOn] = useState<boolean>(false);
  return (
    <ChakraProvider resetCSS={false} theme={theme}>
      <FloatingButton
        opacity={0.8}
        right={10}
        top={10}
        onClick={() => setOn(!on)}
      >
        {on ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </FloatingButton>
      <Overlay on={on} />
    </ChakraProvider>
  );
};

/*
    height: 100vh;
    width: 28.4vw;
    border: 1px solid black;
    z-index: 9999;
    background-color: white;
*/

// // Old Solution:
console.log("Injecting Aline elements...");
const root = document.createElement("div");
root.id = "aline-root";
document.documentElement.appendChild(root);
createRoot(root).render(<App />);
console.log("Injected Aline elements.");

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
