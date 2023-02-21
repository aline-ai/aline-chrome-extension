// NOTE: Conventions is based on https://github.com/airbnb/javascript/tree/master/react

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

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
