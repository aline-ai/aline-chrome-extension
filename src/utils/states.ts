// Move the rest of the states in here
import { atom } from "recoil";

const mainTextState = atom<string>({
  key: "mainTextState",
  default: "",
});

const shadowDomState = atom<HTMLDivElement | null>({
  key: "shadowDomState",
  default: null,
});

export { mainTextState, shadowDomState };
