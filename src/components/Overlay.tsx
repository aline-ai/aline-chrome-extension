import {
  Box,
  Container,
  Skeleton,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import Sidebar from "./Sidebar";

import { mainTextState } from "../utils/states";
import { useRecoilState } from "recoil";

const defaultBoxShadow = "0 5px 10px grey";
export default ({ overlayOn }: { overlayOn: boolean }) => {
  const [boxShadow, setBoxShadow] = useState<string>("none");
  const [mainText, setMainText] = useRecoilState(mainTextState);
  useEffect(() => {
    if (overlayOn) {
      setBoxShadow(defaultBoxShadow);
    } else {
      setTimeout(() => setBoxShadow("none"), 600);
    }
  }, [overlayOn]);

  useEffect(() => {
    const fetchMainText = async () => {
      var data: any | null = null;
      const message: any = {
        message: "simplify",
        url: "https://aline-backend-zqvkdcubfa-uw.a.run.app/simplify",
        options: {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: document.location.href,
            title: document.title,
            html: document.body.innerHTML,
          }),
        },
      };
      data = await chrome.runtime.sendMessage(message);
      while (data == null) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        data = await chrome.runtime.sendMessage(message);
      }
      // @ts-ignore
      setMainText(data.text);
    };
    if (document.readyState === "complete") {
      fetchMainText();
    } else {
      window.addEventListener("load", () => fetchMainText);
      return () => window.removeEventListener("load", fetchMainText);
    }
  }, []);

  return (
    <Box
      position="fixed"
      display="flex"
      height="100vh"
      width="100vw"
      zIndex="99999999"
      top={overlayOn ? 0 : "-100vh"}
      left={0}
      background="white"
      boxShadow={boxShadow}
      transition="top 0.6s ease-in-out"
      fontFamily={"body"}
    >
      <Sidebar overlayOn={overlayOn} />
      <Box flexGrow={1} padding={20} overflowY="scroll">
        <Stack marginX="auto">
          {mainText != "" ? (
            <Container
              id="aline-main-text"
              maxWidth="800px"
              lineHeight={1.5}
              dangerouslySetInnerHTML={{ __html: mainText }}
            ></Container>
          ) : (
            <>
              <Skeleton height="20px" width="200px" />
              {[5, 9, 7, 2, 3].map((i) => (
                <>
                  <br />
                  <SkeletonText noOfLines={i} spacing="4" skeletonHeight="2" />
                </>
              ))}
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};
