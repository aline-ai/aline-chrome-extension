// NOTE: Conventions is based on https://github.com/airbnb/javascript/tree/master/react

import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";

import OpenButton from "./components/OpenButton";
import Sidebar from "./components/Sidebar";
// import theme from "./theme";

const App = () => {
  return (
    // <ChakraProvider theme={theme}>
    <ChakraProvider>
      {/* <div> */}
      <OpenButton />
      <Sidebar />
      {/* </div> */}
      //{" "}
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

// Solution 1:
const root = document.createElement("div");
const body = document.querySelector("body");
document.documentElement.insertBefore(root, body);
ReactDOM.render(<App />, root);

// Solution 2: Inject an inline block (scrapped)
const container = document.createElement("div");
const root = document.createElement("div");
root.id = "aline-root";
// const body = document.querySelector("body")!;
const body = document.getElementsByTagName("body")[0];
// document.documentElement.insertBefore(container, body);
document.documentElement.appendChild(container);

// container.style.display = "flex";

// container.append(root);
// container.append(body);

// console.log("got here");
// ReactDOM.render(<App />, root);
// console.log("got here");

// Solution 2b:
// const root = document.createElement("div");
// root.id = "aline-root";
// const body = document.getElementsByTagName("body")[0];
// body.prepend(root);

// console.log("got here");
// ReactDOM.render(<App />, root);
// console.log("got here");

// Solution 3: using DevTools panel (cursed)

// Solution 4: using iframe (broken AND cursed)

// // Dark magic begins... NOW!
// window.onload = () => {
//   const html = document.documentElement;
//   const items = document.querySelectorAll("html > *");
//   const container = document.createElement("div");
//   const root = document.createElement("div");
//   const iframe = document.createElement("iframe");

//   container.style.display = "flex";
//   container.style.width = "100vw";
//   container.style.height = "100vh";
//   iframe.style.flexGrow = "1";
//   iframe.style.border = "none";

//   document.documentElement.appendChild(container);
//   container.appendChild(root);
//   container.appendChild(iframe);
//   iframe.onload = () => {
//     const iframeDocument = iframe.contentWindow!.document;
//     const iframeHtml = iframeDocument.createElement("html");
//     iframeHtml.style.overflowX = "hidden";
//     iframeDocument.open();
//     iframeDocument.appendChild(iframeHtml);
//     items.forEach((item) => iframeHtml.appendChild(item));
//     iframeDocument.close();
//   };

//   ReactDOM.render(<App />, root);
// };
