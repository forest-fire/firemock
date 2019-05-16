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
/**
 * **setDB**
 *
 * sets the database at a given path
 */
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
/**
 * **updateDB**
 *
 * single-path, non-destructive update to database
 */
function updateDB(path, value) {
    const dotPath = util_1.join(path);
    const oldValue = lodash_get_1.default(exports.db, dotPath);
    const newValue = typeof oldValue === "object" ? Object.assign({}, oldValue, value) : value;
    lodash_set_1.default(exports.db, dotPath, newValue);
    notify(dotPath, newValue, oldValue);
}
exports.updateDB = updateDB;
/**
 * **multiPathUpdateDB**
 *
 * Emulates a Firebase multi-path update. The keys of the dictionary
 * are _paths_ in the DB, the value is the value to set at that path.
 */
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
/**
 * **pushDB**
 *
 * Push a new record into the mock database. Uses the
 * `firebase-key` library to generate the key which
 * attempts to use the same algorithm as Firebase
 * itself.
 */
function pushDB(path, value) {
    const pushId = firebase_key_1.key();
    const fullPath = util_1.join(path, pushId);
    setDB(fullPath, value);
    return pushId;
}
exports.pushDB = pushDB;
/**
 * **addListener**
 *
 * Adds a listener for watched events; setup by
 * the `query.on()` API call.
 *
 * This listener is
 * pushed onto a private stack but can be interogated
 * with a call to `getListeners()` or if you're only
 * interested in the _paths_ which are being watched
 * you can call `listenerPaths()`.
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
/**
 * **removeListener**
 *
 * Removes an active listener (or multiple if the info provided matches more
 * than one).
 *
 * If you provide the `context` property it will use this to identify
 * the listener, if not then it will use `eventType` (if available) as
 * well as `callback` (if available) to identify the callback(s)
 */
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
        // use eventType and callback to identify
        const removed = _listeners
            .filter(l => l.callback === callback)
            .filter(l => l.eventType === eventType);
        _listeners = _listeners.filter(l => l.eventType !== eventType || l.callback !== callback);
        return cancelCallback(removed);
    }
    else {
        // if we have context then we can ignore other params
        const removed = _listeners
            .filter(l => l.callback === callback)
            .filter(l => l.eventType === eventType)
            .filter(l => l.context === context);
        _listeners = _listeners.filter(l => l.context !== context || l.callback !== callback || l.eventType !== eventType);
        return cancelCallback(removed);
    }
}
exports.removeListener = removeListener;
/**
 * internal function responsible for the actual removal of
 * a listener.
 */
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
/**
 * **listenerCount**
 *
 * Provides a numberic count of listeners on the database.
 * Optionally you can state the `EventType` and get a count
 * of only this type of event.
 */
function listenerCount(type) {
    return type ? _listeners.filter(l => l.eventType === type).length : _listeners.length;
}
exports.listenerCount = listenerCount;
/**
 * **listenerPaths**
 *
 * Provides a list of _paths_ in the database which have listeners
 * attached to them. Optionally you can state the `EventType` and filter down to
 * only this type of event or "set of events".
 *
 * You can also just state "child" as the event and it will resolve to all child
 * events: `[ 'child_added', 'child_changed', 'child_removed', 'child_moved' ]`
 */
function listenerPaths(lookFor) {
    if (lookFor && !Array.isArray(lookFor)) {
        lookFor =
            lookFor === "child"
                ? ["child_added", "child_changed", "child_removed", "child_moved"]
                : [lookFor];
    }
    return lookFor
        ? _listeners.filter(l => lookFor.includes(l.eventType)).map(l => l.path)
        : _listeners.map(l => l.path);
}
exports.listenerPaths = listenerPaths;
/**
 * **getListeners**
 *
 * Returns the list of listeners.Optionally you can state the `EventType` and
 * filter down to only this type of event or "set of events".
 *
 * You can also just state "child" as the event and it will resolve to all child
 * events: `[ 'child_added', 'child_changed', 'child_removed', 'child_moved' ]`
 */
function getListeners(lookFor) {
    if (lookFor && !Array.isArray(lookFor)) {
        lookFor =
            lookFor === "child"
                ? ["child_added", "child_changed", "child_removed", "child_moved"]
                : [lookFor];
    }
}
exports.getListeners = getListeners;
/**
 * **notify**
 *
 * A private function used to notify all appropriate listeners when changes
 * in state happen on a given path in the database.
 *
 * @param path the path where the change was made
 * @param newValue the new value
 * @param oldValue the prior value
 */
function notify(path, newValue, oldValue) {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        findValueListeners(path).map(l => {
            let result = {};
            const listeningRoot = lodash_get_1.default(exports.db, l.path);
            if (typeof listeningRoot === "object" && !newValue) {
                result = lodash_get_1.default(exports.db, l.path);
                delete result[util_1.getKey(path)];
            }
            else {
                lodash_set_1.default(result, util_1.pathDiff(path, l.path), newValue);
            }
            return l.callback(new index_1.SnapShot(util_1.join(l.path), result));
        });
        // get relevant listeners and whether path is
        // a direct decendant (aka, the action is a removal or addition)
        const decendants = findChildListeners(path);
        const { parent, key: changeKey } = util_1.keyAndParent(path);
        decendants.forEach(decendant => {
            if (newValue === undefined &&
                decendant.changeIsAtRoot &&
                decendant.eventType === "child_removed") {
                // removal of child
                decendant.callback(new index_1.SnapShot(changeKey, oldValue));
            }
            if (oldValue === undefined &&
                decendant.changeIsAtRoot &&
                decendant.eventType === "child_added") {
                // addition of child
                decendant.callback(new index_1.SnapShot(changeKey, newValue), null);
            }
            const decendantPath = decendant.path + "." + decendant.id;
            if (decendant.eventType === "child_changed") {
                // change took place somewhere in decendant tree
                // therefore "newValue" may be deeper in the structure
                if (decendant.changeIsAtRoot) {
                    decendant.callback(new index_1.SnapShot(changeKey, newValue), priorKey(decendant.path, decendant.id));
                }
                else {
                    // TODO: if the 'id' looks like a number instead of a string weird things ensue.
                    decendant.callback(new index_1.SnapShot(decendant.id, lodash_get_1.default(exports.db, decendantPath)), priorKey(decendant.path, decendant.id));
                }
            }
        });
    }
}
function priorKey(path, id) {
    let previous;
    const ids = lodash_get_1.default(exports.db, path);
    if (typeof ids === "object") {
        return null;
    }
    return Object.keys(ids).reduce((acc, curr) => {
        if (previous === id) {
            return id;
        }
        else {
            previous = id;
            return acc;
        }
    }, null);
}
/**
 * **findChildListeners**
 *
 * Finds "child events" listening to a given _parent path_; optionally
 * allowing for specification of the specific `EventType` or `EventType(s)`.
 *
 * @param changePath the _parent path_ that children are detected off of
 * @param eventTypes <optional> the specific child event (or events) to filter down to; if you have more than one then you should be aware that this property is destructured so the calling function should pass in an array of parameters rather than an array as the second parameter
 */
function findChildListeners(changePath, ...eventTypes) {
    const decendants = _listeners
        .filter(l => changePath.includes(l.path))
        .reduce((acc, listener) => {
        const id = changePath
            .replace(listener.path, "")
            .split(".")
            .filter(i => i)[0]
            .replace(/\./g, "");
        const remainingPath = util_1.stripLeadingDot(changePath.replace(util_1.stripLeadingDot(listener.path), ""));
        const changeIsAtRoot = id === remainingPath;
        acc.push(Object.assign({}, listener, { id, changeIsAtRoot }));
        return acc;
    }, []);
    return decendants;
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