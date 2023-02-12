import { Box } from "@chakra-ui/react";
import React, { useState } from "react";
import FloatingButton from "./FloatingButton";
import SidebarToggleButton from "./SidebarToggleButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

export default function Sidebar(props: any) {
  const [on, setOn] = useState<boolean>(true);
  const width = 0.3 * window.innerWidth;
  const animationTime = "0.4s";
  const animationType = "ease-in-out";
  return (
    <>
      <Box
        height="100vh"
        width={width}
        zIndex={99999}
        backgroundColor="white"
        borderRight="1px solid grey"
        left={on ? 0 : -width}
        transition={`left ${animationTime} ${animationType}`}
        position="fixed"
      >
        This is the sidebar
      </Box>
      <Box
        height="100vh"
        width={on ? width : 0}
        transition={`width ${animationTime} ${animationType}`}
      />{" "}
      {/* This is for spacing */}
      <FloatingButton
        top={props.on ? 10 : "-90vh"}
        left={on ? width + 50 : 50}
        transition={`left ${animationTime} ${animationType}, top 0.6s ${animationType}`}
        onClick={() => {
          setOn(!on);
        }}
      >
        {on ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </FloatingButton>
      {/* <SidebarToggleButton
        on={on}
        top={props.on ? 10 : "-90vh"}
        left={on ? width + 30 : 30}
        transition={`left ${animationTime} ${animationType}, top 0.6s ${animationType}`}
        onClick={() => {
          setOn(!on);
        }}
      /> */}
    </>
  );
}
