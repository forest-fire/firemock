import { IDictionary } from "common-types";

export const dotify = (path: string) => {
  const dotPath = path.replace(/[\\\/]/g, ".");
  return removeDotsAtExtremes(
    dotPath.slice(0, 1) === "." ? dotPath.slice(1) : dotPath
  );
};

export function dotifyKeys(obj: IDictionary) {
  const result: IDictionary = {};
  Object.keys(obj).forEach(key => {
    result[dotify(key)] = obj[key];
  });
  return result;
}

export function removeDotsAtExtremes(path: string) {
  const front = path.slice(0, 1) === "." ? path.slice(1) : path;
  return front.slice(-1) === "." ? front.slice(0, front.length - 1) : front;
}
