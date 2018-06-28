import { set, get } from "lodash";
import { key as fbKey } from "firebase-key";
import { join, pathDiff, getParent, getKey, keyAndParent } from "./util";
import { SnapShot } from "./index";
export let db = [];
let _listeners = [];
export function clearDatabase() {
    db = {};
}
export function updateDatabase(state) {
    db = Object.assign({}, db, state);
}
export function setDB(path, value) {
    const dotPath = join(path);
    const oldValue = get(db, dotPath);
    if (value === null) {
        console.log(dotPath);
        removeDB(dotPath);
    }
    else {
        set(db, dotPath, value);
    }
    notify(dotPath, value, oldValue);
}
/** single-path update */
export function updateDB(path, value) {
    const dotPath = join(path);
    const oldValue = get(db, dotPath);
    const newValue = typeof oldValue === "object" ? Object.assign({}, oldValue, value) : value;
    set(db, dotPath, newValue);
    notify(dotPath, newValue, oldValue);
}
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
export function pushDB(path, value) {
    const pushId = fbKey();
    const fullPath = join(path, pushId);
    setDB(fullPath, value);
    return pushId;
}
export function addListener(path, eventType, callback, cancelCallbackOrContext, context) {
    _listeners.push({
        path: join(path),
        eventType,
        callback,
        cancelCallbackOrContext,
        context
    });
}
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
export function listenerCount(type) {
    return type ? _listeners.filter(l => l.eventType === type).length : _listeners.length;
}
export function listenerPaths(type) {
    return type
        ? _listeners.filter(l => l.eventType === type).map(l => l.path)
        : _listeners.map(l => l.path);
}
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
            const listeningRoot = get(db, l.path);
            if (typeof listeningRoot === "object" && !newValue) {
                result = get(db, l.path);
                delete result[getKey(dotPath)];
            }
            else {
                set(result, pathDiff(dotPath, l.path), newValue);
            }
            return l.callback(new SnapShot(join(l.path), result));
        });
        if (newValue === undefined) {
            const { parent, key } = keyAndParent(dotPath);
            findChildListeners(parent, "child_removed", "child_changed").forEach(l => {
                return l.callback(new SnapShot(key, newValue));
            });
        }
        else if (oldValue === undefined) {
            const { parent, key } = keyAndParent(dotPath);
            findChildListeners(parent, "child_added", "child_changed").forEach(l => {
                return l.callback(new SnapShot(key, newValue));
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
export function findChildListeners(path, ...eventType) {
    const correctPath = _listeners.filter(l => l.path === join(path) && l.eventType !== "value");
    return eventType.length > 0
        ? correctPath.filter(l => eventType.indexOf(l.eventType) !== -1)
        : correctPath;
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
