import set from "lodash.set";
import get from "lodash.get";
import { key as fbKey } from "firebase-key";
import { join, pathDiff, getParent, getKey, keyAndParent, stripLeadingDot, removeDots } from "./util";
import { SnapShot } from "./index";
import { auth as mockedAuth } from "./auth";
export let db = [];
let _listeners = [];
export function clearDatabase() {
    db = {};
}
export function updateDatabase(state) {
    db = Object.assign({}, db, state);
}
export async function auth() {
    return mockedAuth();
}
/**
 * **setDB**
 *
 * sets the database at a given path
 */
export function setDB(path, value) {
    const dotPath = join(path);
    const oldValue = get(db, dotPath);
    if (value === null) {
        removeDB(dotPath);
    }
    else {
        set(db, dotPath, value);
    }
    notify(dotPath, value, oldValue);
}
/**
 * **updateDB**
 *
 * single-path, non-destructive update to database
 */
export function updateDB(path, value) {
    const dotPath = join(path);
    const oldValue = get(db, dotPath);
    const newValue = typeof oldValue === "object" ? Object.assign({}, oldValue, value) : value;
    set(db, dotPath, newValue);
    notify(dotPath, newValue, oldValue);
}
/**
 * **multiPathUpdateDB**
 *
 * Emulates a Firebase multi-path update. The keys of the dictionary
 * are _paths_ in the DB, the value is the value to set at that path.
 */
export function multiPathUpdateDB(data) {
    Object.keys(data).map(key => setDB(key, data[key]));
}
export function removeDB(path) {
    const dotPath = join(path);
    const oldValue = get(db, dotPath);
    const parentValue = get(db, getParent(dotPath));
    if (typeof parentValue === "object") {
        delete parentValue[getKey(dotPath)];
        set(db, getParent(dotPath), parentValue);
    }
    else {
        set(db, dotPath, undefined);
    }
    notify(dotPath, undefined, oldValue);
}
/**
 * **pushDB**
 *
 * Push a new record into the mock database. Uses the
 * `firebase-key` library to generate the key which
 * attempts to use the same algorithm as Firebase
 * itself.
 */
export function pushDB(path, value) {
    const pushId = fbKey();
    const fullPath = join(path, pushId);
    setDB(fullPath, value);
    return pushId;
}
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
export function addListener(path, eventType, callback, cancelCallbackOrContext, context) {
    _listeners.push({
        path: join(path),
        eventType,
        callback,
        cancelCallbackOrContext,
        context
    });
}
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
export function removeListener(eventType, callback, context) {
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
export function removeAllListeners() {
    const howMany = cancelCallback(_listeners);
    _listeners = [];
    return howMany;
}
/**
 * **listenerCount**
 *
 * Provides a numberic count of listeners on the database.
 * Optionally you can state the `EventType` and get a count
 * of only this type of event.
 */
export function listenerCount(type) {
    return type ? _listeners.filter(l => l.eventType === type).length : _listeners.length;
}
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
export function listenerPaths(lookFor) {
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
/**
 * **getListeners**
 *
 * Returns the list of listeners.Optionally you can state the `EventType` and
 * filter down to only this type of event or "set of events".
 *
 * You can also just state "child" as the event and it will resolve to all child
 * events: `[ 'child_added', 'child_changed', 'child_removed', 'child_moved' ]`
 */
export function getListeners(lookFor) {
    if (lookFor && !Array.isArray(lookFor)) {
        lookFor =
            lookFor === "child"
                ? ["child_added", "child_changed", "child_removed", "child_moved"]
                : [lookFor];
    }
}
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
            const listeningRoot = get(db, l.path);
            if (typeof listeningRoot === "object" && !newValue) {
                result = get(db, l.path);
                delete result[getKey(path)];
            }
            else {
                set(result, pathDiff(path, l.path), newValue);
            }
            return l.callback(new SnapShot(join(l.path), result));
        });
        // get relevant listeners and whether path is
        // a direct decendant (aka, the action is a removal or addition)
        const decendants = findChildListeners(path);
        const { parent, key: changeKey } = keyAndParent(path);
        decendants.forEach(decendant => {
            if (newValue === undefined &&
                decendant.changeIsAtRoot &&
                decendant.eventType === "child_removed") {
                // removal of child
                decendant.callback(new SnapShot(changeKey, oldValue));
            }
            if (oldValue === undefined &&
                decendant.changeIsAtRoot &&
                decendant.eventType === "child_added") {
                // addition of child
                decendant.callback(new SnapShot(changeKey, newValue), null);
            }
            const decendantPath = decendant.path + "." + decendant.id;
            if (decendant.eventType === "child_changed") {
                // change took place somewhere in decendant tree
                // therefore "newValue" may be deeper in the structure
                if (decendant.changeIsAtRoot) {
                    decendant.callback(new SnapShot(changeKey, newValue), priorKey(decendant.path, decendant.id));
                }
                else {
                    // TODO: if the 'id' looks like a number instead of a string weird things ensue.
                    decendant.callback(new SnapShot(decendant.id, get(db, decendantPath)), priorKey(decendant.path, decendant.id));
                }
            }
        });
    }
}
function priorKey(path, id) {
    let previous;
    const ids = get(db, path);
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
export function findChildListeners(changePath, ...eventTypes) {
    changePath = stripLeadingDot(changePath.replace(/\//g, "."));
    eventTypes =
        eventTypes.length !== 0
            ? eventTypes
            : ["child_added", "child_changed", "child_moved", "child_removed"];
    const decendants = _listeners
        .filter(l => eventTypes.includes(l.eventType))
        .filter(l => changePath.startsWith(l.path))
        .reduce((acc, listener) => {
        const id = removeDots(changePath
            .replace(listener.path, "")
            .split(".")
            .filter(i => i)[0]);
        const remainingPath = stripLeadingDot(changePath.replace(stripLeadingDot(listener.path), ""));
        const changeIsAtRoot = id === remainingPath;
        acc.push(Object.assign({}, listener, { id, changeIsAtRoot }));
        return acc;
    }, []);
    return decendants;
}
/**
 * Finds all value listeners on a given path or below.
 * Unlike child listeners, Value listeners listen to changes at
 * all points below the registered path.
 *
 * @param path path to root listening point
 */
export function findValueListeners(path) {
    return _listeners.filter(l => join(path).indexOf(join(l.path)) !== -1 && l.eventType === "value");
}
/** Clears the DB and removes all listeners */
export function reset() {
    removeAllListeners();
    clearDatabase();
}
