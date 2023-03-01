import { JSONContent } from "@tiptap/react";

const treeMap = (
  json: JSONContent,
  f: (json: JSONContent) => JSONContent
): JSONContent => {
  json.content = json.content?.map((json) => treeMap(json, f));
  return f(json);
};

const treeFilter = (
  json: JSONContent,
  f: (json: JSONContent) => boolean
): JSONContent => {
  return {
    ...json,
    content: json.content?.filter(f).map((json) => treeFilter(json, f)),
  };
};

const treeFind = (
  json: JSONContent,
  f: (json: JSONContent) => boolean
): JSONContent | null => {
  if (f(json)) return json;
  if (json.content) {
    for (let i = 0; i < json.content?.length; i++) {
      const res = treeFind(json.content[i], f);
      if (res) return res;
    }
  }
  return null;
};

export { treeMap, treeFilter, treeFind };
