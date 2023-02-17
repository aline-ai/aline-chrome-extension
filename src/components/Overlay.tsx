import {
  Box,
  Container,
  Skeleton,
  SkeletonText,
  Stack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

import Sidebar from "./Sidebar";

// const extractor: any = require("unfluff");

// import { extractFromHtml } from "@extractus/article-extractor";

import { compile, HtmlToTextOptions } from "html-to-text";

const options: HtmlToTextOptions = {
  wordwrap: false,
  preserveNewlines: true,
  decodeEntities: false,
  selectors: [
    { selector: "a", format: "blockTag" },
    { selector: "p", format: "blockTag" },
    { selector: "h1", format: "blockTag" },
    { selector: "h2", format: "blockTag" },
    { selector: "h3", format: "blockTag" },
    { selector: "ul", format: "blockTag" },
    { selector: "li", format: "blockTag" },
    { selector: "b", format: "blockTag" },
    { selector: "em", format: "blockTag" },
    { selector: "i", format: "blockTag" },
    { selector: "u", format: "blockTag" },
    { selector: "del", format: "blockTag" },
    { selector: "s", format: "blockTag" },
    { selector: "blockquote", format: "blockTag" },
    { selector: "hr", format: "blockTag" },
  ],
};
const compiledConvert = compile(options); // options passed here

const defaultBoxShadow = "0 5px 10px grey";
export default ({ overlayOn }: { overlayOn: boolean }) => {
  const [boxShadow, setBoxShadow] = useState<string>(defaultBoxShadow);
  const [mainText, setMainText] = useState<string>("");
  useEffect(() => {
    if (overlayOn) {
      setBoxShadow(defaultBoxShadow);
    } else {
      setTimeout(() => setBoxShadow("none"), 600);
    }
  }, [overlayOn]);

  useEffect(() => {
    (async () => {
      // const response = await fetch(
      //   "https://aline-backend-zqvkdcubfa-uw.a.run.app/",
      //   {
      //     method: "POST",
      //     mode: "cors",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       url: document.location.href,
      //       body: document.body.innerHTML,
      //     }),
      //   }
      // );
      console.log(document.body.innerHTML);
      const data = await chrome.runtime.sendMessage({
        message: "fetch",
        url: document.location.href,
        options: {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: document.location.href,
            html: document.body.innerHTML,
          }),
        },
      });
      // console.log(response);
      // const data = await response.json();
      console.log(data);
      // @ts-ignore
      setMainText(data);
    })();
  }, []);

  return (
    <Box
      position="fixed"
      display="flex"
      height="100vh"
      width="100vw"
      zIndex="9999"
      top={overlayOn ? 0 : "-100vh"}
      left={0}
      background="white"
      boxShadow={boxShadow}
      transition="top 0.6s ease-in-out"
      fontFamily={"body"}
    >
      <Sidebar overlayOn={overlayOn} />
      <Box flexGrow={1} padding={20} overflowY="scroll">
        <Stack maxWidth={800} marginX="auto">
          {mainText != "" ? (
            <Container
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
