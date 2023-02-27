import { Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import FloatingButton from "./FloatingButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import SidebarContent from "./SidebarContent";

const animationTime = "0.4s";
const animationType = "ease-in-out";

export default ({ overlayOn }: { overlayOn: boolean }) => {
  const [on, setOn] = useState<boolean>(true);
  const [width, setWidth] = useState<number>(0.3 * window.innerWidth);

  // let width = 0.3 * window.innerWidth; // make this update on window resize
  useEffect(() => {
    const handleResize = () => setWidth(0.3 * window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [oldHTMLOverflow, setOldHTMLOverflow] = useState<string>("auto");

  useEffect(() => {
    setOldHTMLOverflow(document.documentElement.style.overflow);
    if (overlayOn) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = oldHTMLOverflow;
    }
  }, [overlayOn]);

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
        <SidebarContent />
      </Box>
      <Box
        height="100vh"
        width={on ? width : 0}
        transition={`width ${animationTime} ${animationType}`}
      />{" "}
      {/* This is for spacing */}
      <FloatingButton
        top={overlayOn ? 10 : "-90vh"}
        left={on ? width + 50 : 50}
        transition={`left ${animationTime} ${animationType}, top 0.6s ${animationType}`}
        onClick={() => {
          setOn(!on);
        }}
      >
        {on ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </FloatingButton>
    </>
  );
};
