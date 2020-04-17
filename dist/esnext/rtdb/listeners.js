import { SerializedQuery } from "serialized-query";
import { join, stripLeadingDot, removeDots } from "../shared/util";
import get from "lodash.get";
import { getDb, shouldSendEvents, groupEventsByWatcher } from "./store";
import { hashToArray } from "typed-conversions";
import { Reference, SnapShot } from "./index";
import { dotify } from "../shared/dotify";
let _listeners = [];
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
export async function addListener(pathOrQuery, eventType, callback, cancelCallbackOrContext, context) {
    const query = (typeof pathOrQuery === "string"
        ? new SerializedQuery(join(pathOrQuery))
        : pathOrQuery);
    pathOrQuery = (typeof pathOrQuery === "string"
        ? join(pathOrQuery)
        : query.path);
    _listeners.push({
        id: Math.random()
            .toString(36)
            .substr(2, 10),
        query,
        eventType,
        callback,
        cancelCallbackOrContext,
        context
    });
    function ref(dbPath) {
        return new Reference(dbPath);
    }
    const snapshot = await query
        .deserialize({ ref })
        .once(eventType === "value" ? "value" : "child_added");
    if (eventType === "value") {
        callback(snapshot);
    }
    else {
        const list = hashToArray(snapshot.val());
        if (eventType === "child_added") {
            list.forEach((i) => callback(new SnapShot(join(query.path, i.id), i)));
        }
    }
    return snapshot;
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
        _listeners = _listeners.filter(l => l.context !== context ||
            l.callback !== callback ||
            l.eventType !== eventType);
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
    return type
        ? _listeners.filter(l => l.eventType === type).length
        : _listeners.length;
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
        ? _listeners
            .filter(l => lookFor.includes(l.eventType))
            .map(l => l.query.path)
        : _listeners.map(l => l.query.path);
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
    const childEvents = [
        "child_added",
        "child_changed",
        "child_removed",
        "child_moved"
    ];
    const allEvents = childEvents.concat(["value"]);
    const events = !lookFor
        ? allEvents
        : lookFor === "child"
            ? childEvents
            : lookFor;
    return _listeners.filter(l => events.includes(l.eventType));
}
function keyDidNotPreviouslyExist(e, dbSnapshot) {
    return get(dbSnapshot, e.key) === undefined ? true : false;
}
/**
 * **notify**
 *
 * Based on a dictionary of paths/values it reduces this to events to
 * send to zero or more listeners.
 */
export function notify(data, dbSnapshot) {
    if (!shouldSendEvents()) {
        return;
    }
    const events = groupEventsByWatcher(data, dbSnapshot);
    events.forEach(evt => {
        const isDeleteEvent = evt.value === null || evt.value === undefined;
        switch (evt.listenerEvent) {
            case "child_removed":
                if (isDeleteEvent) {
                    evt.callback(new SnapShot(evt.key, evt.priorValue));
                }
                return;
            case "child_added":
                if (!isDeleteEvent && keyDidNotPreviouslyExist(evt, dbSnapshot)) {
                    evt.callback(new SnapShot(evt.key, evt.value));
                }
                return;
            case "child_changed":
                if (!isDeleteEvent) {
                    evt.callback(new SnapShot(evt.key, evt.value));
                }
                return;
            case "child_moved":
                if (!isDeleteEvent && keyDidNotPreviouslyExist(evt, dbSnapshot)) {
                    // TODO: if we implement sorting then add the previousKey value
                    evt.callback(new SnapShot(evt.key, evt.value));
                }
                return;
            case "value":
                const snapKey = new SnapShot(evt.listenerPath, evt.value).key;
                if (snapKey === evt.key) {
                    // root set
                    evt.callback(new SnapShot(evt.listenerPath, evt.value === null || evt.value === undefined
                        ? undefined
                        : { [evt.key]: evt.value }));
                }
                else {
                    // property set
                    const value = evt.value === null ? getDb(evt.listenerPath) : evt.value;
                    evt.callback(new SnapShot(evt.listenerPath, value));
                }
        } // end switch
    });
}
function priorKey(path, id) {
    let previous;
    const ids = getDb(path);
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
        .filter(l => changePath.startsWith(dotify(l.query.path)))
        .reduce((acc, listener) => {
        const id = removeDots(changePath
            .replace(listener.query.path, "")
            .split(".")
            .filter(i => i)[0]);
        const remainingPath = stripLeadingDot(changePath.replace(stripLeadingDot(listener.query.path), ""));
        const changeIsAtRoot = id === remainingPath;
        acc.push(Object.assign(Object.assign({}, listener), { id, changeIsAtRoot }));
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
    return _listeners.filter(l => join(path).indexOf(join(l.query.path)) !== -1 && l.eventType === "value");
}
//# sourceMappingURL=listeners.js.map