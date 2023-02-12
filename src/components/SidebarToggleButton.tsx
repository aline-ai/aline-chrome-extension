import React from "react";
import { Button } from "@chakra-ui/react";
import FloatingButton from "./FloatingButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

export default function SidebarToggleButton(props: any) {
  return (
    <FloatingButton
      left={props.left}
      top={props.top}
      onClick={props.onClick}
      transition={props.transition}
    >
      {props.on ? <ChevronLeftIcon /> : <ChevronRightIcon />}
    </FloatingButton>
  );
}
