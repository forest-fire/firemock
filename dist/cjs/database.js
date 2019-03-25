"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_set_1 = __importDefault(require("lodash.set"));
const lodash_get_1 = __importDefault(require("lodash.get"));
const firebase_key_1 = require("firebase-key");
const util_1 = require("./util");
const index_1 = require("./index");
const auth_1 = require("./auth");
exports.db = [];
let _listeners = [];
function clearDatabase() {
    exports.db = {};
}
exports.clearDatabase = clearDatabase;
function updateDatabase(state) {
    exports.db = Object.assign({}, exports.db, state);
}
exports.updateDatabase = updateDatabase;
async function auth() {
    return auth_1.auth();
}
exports.auth = auth;
function setDB(path, value) {
    const dotPath = util_1.join(path);
    const oldValue = lodash_get_1.default(exports.db, dotPath);
    if (value === null) {
        removeDB(dotPath);
    }
    else {
        lodash_set_1.default(exports.db, dotPath, value);
    }
    notify(dotPath, value, oldValue);
}
exports.setDB = setDB;
/** single-path update */
function updateDB(path, value) {
    const dotPath = util_1.join(path);
    const oldValue = lodash_get_1.default(exports.db, dotPath);
    const newValue = typeof oldValue === "object" ? Object.assign({}, oldValue, value) : value;
    lodash_set_1.default(exports.db, dotPath, newValue);
    notify(dotPath, newValue, oldValue);
}
exports.updateDB = updateDB;
function multiPathUpdateDB(data) {
    Object.keys(data).map(key => setDB(key, data[key]));
}
exports.multiPathUpdateDB = multiPathUpdateDB;
function removeDB(path) {
    const dotPath = util_1.join(path);
    const oldValue = lodash_get_1.default(exports.db, dotPath);
    const parentValue = lodash_get_1.default(exports.db, util_1.getParent(dotPath));
    if (typeof parentValue === "object") {
        delete parentValue[util_1.getKey(dotPath)];
        lodash_set_1.default(exports.db, util_1.getParent(dotPath), parentValue);
    }
    else {
        lodash_set_1.default(exports.db, dotPath, undefined);
    }
    notify(dotPath, undefined, oldValue);
}
exports.removeDB = removeDB;
function pushDB(path, value) {
    const pushId = firebase_key_1.key();
    const fullPath = util_1.join(path, pushId);
    setDB(fullPath, value);
    return pushId;
}
exports.pushDB = pushDB;
/**
 * adds a listener for watched events; setup by
 * the "on" API
 */
function addListener(path, eventType, callback, cancelCallbackOrContext, context) {
    _listeners.push({
        path: util_1.join(path),
        eventType,
        callback,
        cancelCallbackOrContext,
        context
    });
}
exports.addListener = addListener;
function removeListener(eventType, callback, context) {
    if (!eventType) {
        return removeAllListeners();
    }
    if (!callback) {
        const removed = _listeners.filter(l => l.eventType === eventType);
        _listeners = _listeners.filter(l => l.eventType !== eventType);
        return cancelCallback(removed);
    }
    if (!context) {
        const removed = _listeners
            .filter(l => l.callback === callback)
            .filter(l => l.eventType === eventType);
        _listeners = _listeners.filter(l => l.eventType !== eventType || l.callback !== callback);
        return cancelCallback(removed);
    }
    else {
        const removed = _listeners
            .filter(l => l.callback === callback)
            .filter(l => l.eventType === eventType)
            .filter(l => l.context === context);
        _listeners = _listeners.filter(l => l.context !== context || l.callback !== callback || l.eventType !== eventType);
        return cancelCallback(removed);
    }
}
exports.removeListener = removeListener;
function cancelCallback(removed) {
    let count = 0;
    removed.forEach(l => {
        if (typeof l.cancelCallbackOrContext === "function") {
            l.cancelCallbackOrContext();
            count++;
        }
    });
    return count;
}
function removeAllListeners() {
    const howMany = cancelCallback(_listeners);
    _listeners = [];
    return howMany;
}
exports.removeAllListeners = removeAllListeners;
function listenerCount(type) {
    return type ? _listeners.filter(l => l.eventType === type).length : _listeners.length;
}
exports.listenerCount = listenerCount;
function listenerPaths(type) {
    return type
        ? _listeners.filter(l => l.eventType === type).map(l => l.path)
        : _listeners.map(l => l.path);
}
exports.listenerPaths = listenerPaths;
/**
 * Notifies all appropriate "child" event listeners when changes
 * in state happen
 *
 * @param dotPath the path where the change was made
 * @param newValue the new value
 * @param oldValue the prior value
 */
function notify(dotPath, newValue, oldValue) {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        findValueListeners(dotPath).map(l => {
            let result = {};
            const listeningRoot = lodash_get_1.default(exports.db, l.path);
            if (typeof listeningRoot === "object" && !newValue) {
                result = lodash_get_1.default(exports.db, l.path);
                delete result[util_1.getKey(dotPath)];
            }
            else {
                lodash_set_1.default(result, util_1.pathDiff(dotPath, l.path), newValue);
            }
            return l.callback(new index_1.SnapShot(util_1.join(l.path), result));
        });
        if (newValue === undefined) {
            const { parent, key } = util_1.keyAndParent(dotPath);
            findChildListeners(parent, "child_removed", "child_changed").forEach(l => {
                return l.callback(new index_1.SnapShot(key, newValue));
            });
        }
        else if (oldValue === undefined) {
            const { parent, key } = util_1.keyAndParent(dotPath);
            findChildListeners(parent, "child_added", "child_changed").forEach(l => {
                return l.callback(new index_1.SnapShot(key, newValue));
            });
        }
    }
}
/**
 * Finds "child events" listening to a given parent path; optionally
 * allowing for specification of the specific event type
 *
 * @param path the parent path that children are detected off of
 * @param eventType <optional> the specific child event to filter down to
 */
function findChildListeners(path, ...eventType) {
    const correctPath = _listeners.filter(l => l.path === util_1.join(path) && l.eventType !== "value");
    return eventType.length > 0
        ? correctPath.filter(l => eventType.indexOf(l.eventType) !== -1)
        : correctPath;
}
exports.findChildListeners = findChildListeners;
/**
 * Finds all value listeners on a given path or below.
 * Unlike child listeners, Value listeners listen to changes at
 * all points below the registered path.
 *
 * @param path path to root listening point
 */
function findValueListeners(path) {
    return _listeners.filter(l => util_1.join(path).indexOf(util_1.join(l.path)) !== -1 && l.eventType === "value");
}
exports.findValueListeners = findValueListeners;
/** Clears the DB and removes all listeners */
function reset() {
    removeAllListeners();
    clearDatabase();
}
exports.reset = reset;
//# sourceMappingURL=database.js.map