import React from "react";
import FloatingButton from "./FloatingButton";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";

export default function OverlayToggleButton(props: any) {
  // TODO: fix any
  return (
    <FloatingButton opacity={0.8} right={10} top={10} onClick={props.onClick}>
      {props.on ? <ChevronDownIcon /> : <ChevronUpIcon />}
    </FloatingButton>
  );
}
