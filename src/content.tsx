// NOTE: Conventions is based on https://github.com/airbnb/javascript/tree/master/react

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// // Old Solution:
// TODO: check if window is large enough
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
