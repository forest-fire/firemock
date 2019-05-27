// tslint:disable:no-implicit-dependencies
import { pathJoin } from "common-types";
import set from "lodash.set";
import get from "lodash.get";
import { key as fbKey } from "firebase-key";
import { deepEqual } from "fast-equals";
import { join, getParent, getKey, stripLeadingDot, removeDots } from "./util";
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
export function getDb(path) {
    return get(db, path);
}
/**
 * **setDB**
 *
 * sets the database at a given path
 */
export function setDB(path, value, silent = false) {
    const dotPath = join(path);
    const oldRef = get(db, dotPath);
    const oldValue = typeof oldRef === "object" ? Object.assign({}, oldRef, {}) : oldRef;
    const isReference = ["object", "array"].includes(typeof value);
    // ignore if no change
    if ((isReference && deepEqual(oldValue, value)) ||
        (!isReference && oldValue === value)) {
        return;
    }
    // run notify first because otherwise notify
    // will not be able to do change detection
    // at the watcher level
    notify({ [path]: value });
    if (value === null) {
        const parentValue = get(db, getParent(dotPath));
        if (typeof parentValue === "object") {
            delete parentValue[getKey(dotPath)];
            set(db, getParent(dotPath), parentValue);
        }
        else {
            set(db, dotPath, undefined);
        }
    }
    else {
        set(db, dotPath, value);
    }
}
/**
 * **updateDB**
 *
 * single-path, non-destructive update to database
 */
export function updateDB(path, value) {
    const dotPath = join(path);
    const oldValue = get(db, dotPath);
    let changed = true;
    if (typeof value === "object" &&
        Object.keys(value).every(k => (oldValue ? oldValue[k] : null) === value[k])) {
        changed = false;
    }
    if (typeof value !== "object" && value === oldValue) {
        changed = false;
    }
    if (!changed) {
        return;
    }
    const newValue = typeof oldValue === "object" ? Object.assign({}, oldValue, value) : value;
    setDB(dotPath, newValue);
}
/**
 * **multiPathUpdateDB**
 *
 * Emulates a Firebase multi-path update. The keys of the dictionary
 * are _paths_ in the DB, the value is the value to set at that path.
 *
 * **Note:** dispatch notifations must not be done at _path_ level but
 * instead grouped up by _watcher_ level.
 */
export function multiPathUpdateDB(data) {
    // notify at group level
    // we're doing this first so no delta/change data is lost
    notify(data);
    // set DB to new values
    Object.keys(data).map(key => {
        const value = data[key];
        const path = key;
        if (get(db, path) !== value) {
            // silent sets
            setDB(path, value, true);
        }
    });
}
const dotify = (path) => {
    const dotPath = path.replace(/[\\\/]/g, ".");
    return dotPath.slice(0, 1) === "." ? dotPath.slice(1) : dotPath;
};
/**
 * Will aggregate the data passed in to dictionary objects of paths
 * which fire at the root of the listeners/watchers that are currently
 * on the database.
 *
 * **Note:** if there was NO actual change between old and new values
 * there will be no notification sent
 */
function groupEventsByWatcher(data) {
    const ignoreUnchanged = (path) => data[path] !== getDb(path);
    const eventPaths = Object.keys(data).filter(ignoreUnchanged);
    const response = [];
    const relativePath = (full, partial) => {
        return full.replace(partial, "");
    };
    const justKey = (obj) => (obj ? Object.keys(obj)[0] : null);
    const justValue = (obj) => (justKey(obj) ? obj[justKey(obj)] : null);
    getListeners().forEach(l => {
        const eventPathsUnderListener = eventPaths.filter(e => e.includes(l.path));
        const paths = [];
        const changeObject = eventPathsUnderListener.reduce((changes, path) => {
            paths.push(path);
            if (l.path === path) {
                changes = data[path];
            }
            else {
                set(changes, dotify(relativePath(path, l.path)), data[path]);
            }
            return changes;
        }, {});
        console.log(l.path);
        response.push({
            listenerId: l.id,
            listenerPath: l.path,
            listenerEvent: l.eventType,
            callback: l.callback,
            eventPaths: paths,
            key: dotify(pathJoin(l.path, justKey(changeObject))),
            value: justValue(changeObject),
            priorValue: justValue(getDb(l.path))
        });
    });
    return response;
}
export function removeDB(path) {
    setDB(path, null);
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
        id: Math.random()
            .toString(36)
            .substr(2, 10),
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
    const childEvents = ["child_added", "child_changed", "child_removed", "child_moved"];
    const allEvents = childEvents.concat(["value"]);
    const events = !lookFor ? allEvents : lookFor === "child" ? childEvents : lookFor;
    return _listeners.filter(l => events.includes(l.eventType));
}
function keyDidNotPreviouslyExist(e) {
    return getDb(e.key) === undefined ? true : false;
}
/**
 * **notify**
 *
 * Based on a dictionary of paths/values it reduces this to events to
 * send to zero or more listeners.
 */
function notify(data) {
    const events = groupEventsByWatcher(data);
    events.forEach(e => {
        switch (e.listenerEvent) {
            case "child_removed":
                if (e.value === null) {
                    e.callback(new SnapShot(e.key, e.priorValue));
                }
                return;
            case "child_added":
                if (e.value !== null && keyDidNotPreviouslyExist(e)) {
                    e.callback(new SnapShot(e.key, e.value));
                }
                return;
            case "child_changed":
                if (e.value !== null) {
                    e.callback(new SnapShot(e.key, e.value));
                }
                return;
            case "child_moved":
                if (e.value !== null && keyDidNotPreviouslyExist(e)) {
                    // TODO: if we implement sorting then add the previousKey value
                    e.callback(new SnapShot(e.key, e.value));
                }
                return;
            case "value":
                e.callback(new SnapShot(e.key, e.value));
                return;
        }
    });
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
//# sourceMappingURL=database.js.map