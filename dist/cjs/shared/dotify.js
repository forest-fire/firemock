"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotify = (path) => {
    const dotPath = path.replace(/[\\\/]/g, ".");
    return removeDotsAtExtremes(dotPath.slice(0, 1) === "." ? dotPath.slice(1) : dotPath);
};
function dotifyKeys(obj) {
    const result = {};
    Object.keys(obj).forEach(key => {
        result[exports.dotify(key)] = obj[key];
    });
    return result;
}
exports.dotifyKeys = dotifyKeys;
function removeDotsAtExtremes(path) {
    const front = path.slice(0, 1) === "." ? path.slice(1) : path;
    return front.slice(-1) === "." ? front.slice(0, front.length - 1) : front;
}
exports.removeDotsAtExtremes = removeDotsAtExtremes;
//# sourceMappingURL=dotify.js.map