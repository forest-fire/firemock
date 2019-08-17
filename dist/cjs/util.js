"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_first_1 = __importDefault(require("lodash.first"));
const lodash_last_1 = __importDefault(require("lodash.last"));
const common_types_1 = require("common-types");
function normalizeRef(r) {
    r = r.replace("/", ".");
    r = r.slice(0, 1) === "." ? r.slice(1) : r;
    return r;
}
exports.normalizeRef = normalizeRef;
function parts(r) {
    return normalizeRef(r).split(".");
}
exports.parts = parts;
/**
 * return the last component of the path
 * which typically would represent the 'id'
 * of a list-node
 */
function leafNode(r) {
    return parts(r).pop();
}
exports.leafNode = leafNode;
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomInt = getRandomInt;
function firstProp(listOf) {
    return listOf ? listOf[firstKey(listOf)] : {};
}
exports.firstProp = firstProp;
function lastProp(listOf) {
    return listOf[lastKey(listOf)];
}
exports.lastProp = lastProp;
function objectIndex(obj, index) {
    const keys = Object.keys(obj);
    return keys ? obj[keys[index - 1]] : null;
}
exports.objectIndex = objectIndex;
function firstKey(listOf) {
    return lodash_first_1.default(Object.keys(listOf));
}
exports.firstKey = firstKey;
function lastKey(listOf) {
    return lodash_last_1.default(Object.keys(listOf));
}
exports.lastKey = lastKey;
function removeKeys(obj, remove) {
    return Object.keys(obj).reduce((agg, v) => {
        if (remove.indexOf(v) === -1) {
            agg[v] = obj[v];
        }
        return agg;
    }, {});
}
exports.removeKeys = removeKeys;
/**
 * Joins a set of paths together and converts into
 * correctly formatted "dot notation" directory path
 */
function join(...paths) {
    return paths
        .map(p => {
        return p.replace(/[\/\\]/gm, ".");
    })
        .map(p => (p.slice(-1) === "." ? p.slice(0, p.length - 1) : p))
        .map(p => (p.slice(0, 1) === "." ? p.slice(1) : p))
        .join(".");
}
exports.join = join;
function pathDiff(longPath, pathSubset) {
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
exports.pathDiff = pathDiff;
function orderedSnapToJS(snap) {
    const jsObject = {};
    snap.forEach(record => (jsObject[record.key] = record.val()));
    return jsObject;
}
exports.orderedSnapToJS = orderedSnapToJS;
/**
 * Given a path, returns the parent path and child key
 */
function keyAndParent(dotPath) {
    const sections = dotPath.split(".");
    const changeKey = sections.pop();
    const parent = sections.join(".");
    return { parent, key: changeKey };
}
exports.keyAndParent = keyAndParent;
/** converts a '/' delimited path to a '.' delimited one */
function dotNotation(path) {
    path = path.slice(0, 1) === "/" ? path.slice(1) : path;
    return path ? path.replace(/\//g, ".") : undefined;
}
exports.dotNotation = dotNotation;
function slashNotation(path) {
    return path.replace(/\./g, "/");
}
exports.slashNotation = slashNotation;
/** Get the parent DB path */
function getParent(dotPath) {
    return keyAndParent(dotPath).parent;
}
exports.getParent = getParent;
/** Get the Key from the end of a path string */
function getKey(dotPath) {
    return keyAndParent(dotPath).key;
}
exports.getKey = getKey;
/** named network delays */
var Delays;
(function (Delays) {
    Delays["random"] = "random";
    Delays["weak"] = "weak-mobile";
    Delays["mobile"] = "mobile";
    Delays["WiFi"] = "WIFI";
})(Delays = exports.Delays || (exports.Delays = {}));
let _delay = 5;
function setNetworkDelay(value) {
    _delay = value;
}
exports.setNetworkDelay = setNetworkDelay;
async function networkDelay(returnValue) {
    await common_types_1.wait(calcDelay());
    return returnValue;
}
exports.networkDelay = networkDelay;
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
function stripLeadingDot(str) {
    return str.slice(0, 1) === "." ? str.slice(1) : str;
}
exports.stripLeadingDot = stripLeadingDot;
function removeDots(str) {
    return str ? str.replace(/\./g, "") : undefined;
}
exports.removeDots = removeDots;
//# sourceMappingURL=util.js.map