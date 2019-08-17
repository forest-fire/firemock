import first from "lodash.first";
import last from "lodash.last";
import { wait } from "common-types";
export function normalizeRef(r) {
    r = r.replace("/", ".");
    r = r.slice(0, 1) === "." ? r.slice(1) : r;
    return r;
}
export function parts(r) {
    return normalizeRef(r).split(".");
}
/**
 * return the last component of the path
 * which typically would represent the 'id'
 * of a list-node
 */
export function leafNode(r) {
    return parts(r).pop();
}
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function firstProp(listOf) {
    return listOf ? listOf[firstKey(listOf)] : {};
}
export function lastProp(listOf) {
    return listOf[lastKey(listOf)];
}
export function objectIndex(obj, index) {
    const keys = Object.keys(obj);
    return keys ? obj[keys[index - 1]] : null;
}
export function firstKey(listOf) {
    return first(Object.keys(listOf));
}
export function lastKey(listOf) {
    return last(Object.keys(listOf));
}
export function removeKeys(obj, remove) {
    return Object.keys(obj).reduce((agg, v) => {
        if (remove.indexOf(v) === -1) {
            agg[v] = obj[v];
        }
        return agg;
    }, {});
}
/**
 * Joins a set of paths together and converts into
 * correctly formatted "dot notation" directory path
 */
export function join(...paths) {
    return paths
        .map(p => {
        return p.replace(/[\/\\]/gm, ".");
    })
        .map(p => (p.slice(-1) === "." ? p.slice(0, p.length - 1) : p))
        .map(p => (p.slice(0, 1) === "." ? p.slice(1) : p))
        .join(".");
}
export function pathDiff(longPath, pathSubset) {
    const subset = pathSubset.split(".");
    const long = longPath.split(".");
    if (subset.length > long.length ||
        JSON.stringify(long.slice(0, subset.length)) !== JSON.stringify(subset)) {
        throw new Error(`"${pathSubset}" is not a subset of ${longPath}`);
    }
    return long.length === subset.length
        ? ""
        : long.slice(subset.length - long.length).join(".");
}
export function orderedSnapToJS(snap) {
    const jsObject = {};
    snap.forEach(record => (jsObject[record.key] = record.val()));
    return jsObject;
}
/**
 * Given a path, returns the parent path and child key
 */
export function keyAndParent(dotPath) {
    const sections = dotPath.split(".");
    const changeKey = sections.pop();
    const parent = sections.join(".");
    return { parent, key: changeKey };
}
/** converts a '/' delimited path to a '.' delimited one */
export function dotNotation(path) {
    path = path.slice(0, 1) === "/" ? path.slice(1) : path;
    return path ? path.replace(/\//g, ".") : undefined;
}
export function slashNotation(path) {
    return path.replace(/\./g, "/");
}
/** Get the parent DB path */
export function getParent(dotPath) {
    return keyAndParent(dotPath).parent;
}
/** Get the Key from the end of a path string */
export function getKey(dotPath) {
    return keyAndParent(dotPath).key;
}
/** named network delays */
export var Delays;
(function (Delays) {
    Delays["random"] = "random";
    Delays["weak"] = "weak-mobile";
    Delays["mobile"] = "mobile";
    Delays["WiFi"] = "WIFI";
})(Delays || (Delays = {}));
let _delay = 5;
export function setNetworkDelay(value) {
    _delay = value;
}
export async function networkDelay(returnValue) {
    await wait(calcDelay());
    return returnValue;
}
function calcDelay() {
    const delay = _delay;
    if (typeof delay === "number") {
        return delay;
    }
    if (Array.isArray(delay)) {
        const [min, max] = delay;
        return getRandomInt(min, max);
    }
    if (typeof delay === "object" && !Array.isArray(delay)) {
        const { min, max } = delay;
        return getRandomInt(min, max);
    }
    // these numbers need some reviewing
    if (delay === "random") {
        return getRandomInt(10, 300);
    }
    // if (delay === "weak") {
    //   return getRandomInt(400, 900);
    // }
    if (delay === "mobile") {
        return getRandomInt(300, 500);
    }
    if (delay === "WIFI") {
        return getRandomInt(10, 100);
    }
    throw new Error("Delay property is of unknown format: " + delay);
}
export function stripLeadingDot(str) {
    return str.slice(0, 1) === "." ? str.slice(1) : str;
}
export function removeDots(str) {
    return str ? str.replace(/\./g, "") : undefined;
}
//# sourceMappingURL=util.js.map