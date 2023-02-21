// Move the rest of the states in here
import { atom } from "recoil";

const mainTextState = atom<string>({
  key: "mainTextState",
  default: "",
});

export { mainTextState };
