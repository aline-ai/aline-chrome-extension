import { JSONContent } from "@tiptap/react";
import { v4 as uuidv4 } from "uuid";

const getRangeOfMark = (
  json: JSONContent,
  markType: string
): [number | null, number] => {
  // perform a dfs throught the document and find the first and last autocomplete elements
  var first: number | null = null,
    last: number = 0,
    current: number = 0;
  console.log(json);

  const traverse = (json: JSONContent) => {
    if (json.content) {
      current += 1;
    }
    if (json.text) {
      if (json.marks?.find((e) => e.type == markType)) {
        if (first == null) first = current - 1;
        last = current + json.text.length;
      }
      current += json.text.length;
    }
    if (json.content) {
      for (let i = 0; i < json.content.length; i++) {
        traverse(json.content[i]);
      }
      current += 1;
    }
  };
  traverse(json);
  return [first, last];
};

const cursorIndicator = "CURSOR_INDICATOR-" + uuidv4();

const unescapeHTML = (str: string) =>
  str
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace("&#8217;", "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

export { getRangeOfMark, cursorIndicator, unescapeHTML };
