// tslint:disable:no-implicit-dependencies
import { pathJoin } from "common-types";
import set from "lodash.set";
import get from "lodash.get";
import { key as fbKey } from "firebase-key";
import { deepEqual } from "fast-equals";
import copy from "fast-copy";
import deepmerge from "deepmerge";
import { auth as mockedAuth } from "../auth";
import { join, getParent, getKey, dotifyKeys, dotify } from "../shared/index";
import { getListeners, removeAllListeners, notify } from "../rtdb/index";
/**
 * The in-memory dictionary/hash mantained by the mock RTDB to represent
 * the state of the database
 */
let db = {};
let _silenceEvents = false;
/**
 * silences the database from sending events;
 * this is not typically done but can be done
 * as part of the Mocking process to reduce noise
 */
export function silenceEvents() {
    _silenceEvents = true;
}
/**
 * returns the database to its default state of sending
 * events out.
 */
export function restoreEvents() {
    _silenceEvents = false;
}
export function shouldSendEvents() {
    return !_silenceEvents;
}
/** clears the DB without losing reference to DB object */
export function clearDatabase() {
    const keys = Object.keys(db);
    keys.forEach(key => delete db[key]);
}
/**
 * updates the state of the database based on a
 * non-descructive update.
 */
export function updateDatabase(updatedState) {
    db = deepmerge(db, updatedState);
}
export async function auth() {
    return mockedAuth();
}
export function getDb(path) {
    return path ? get(db, dotify(path)) : db;
}
/**
 * **setDB**
 *
 * sets the database at a given path
 */
export function setDB(path, value, silent = false) {
    const dotPath = join(path);
    const oldRef = get(db, dotPath);
    const oldValue = typeof oldRef === "object" ? Object.assign(Object.assign({}, oldRef), {}) : oldRef;
    const isReference = ["object", "array"].includes(typeof value);
    const dbSnapshot = copy(Object.assign({}, db));
    // ignore if no change
    if ((isReference && deepEqual(oldValue, value)) ||
        (!isReference && oldValue === value)) {
        return;
    }
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
    if (!silent) {
        notify({ [dotPath]: value }, dbSnapshot);
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
        Object.keys(value).every(k => (oldValue ? oldValue[k] : null) ===
            value[k])) {
        changed = false;
    }
    if (typeof value !== "object" && value === oldValue) {
        changed = false;
    }
    if (!changed) {
        return;
    }
    const newValue = typeof oldValue === "object" ? Object.assign(Object.assign({}, oldValue), value) : value;
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
    const snapshot = copy(db);
    Object.keys(data).map(key => {
        const value = data[key];
        const path = key;
        if (get(db, path) !== value) {
            // silent set
            setDB(path, value, true);
        }
    });
    notify(data, snapshot);
}
const slashify = (path) => {
    const slashPath = path.replace(/\./g, "/");
    return slashPath.slice(0, 1) === "/" ? slashPath.slice(1) : slashPath;
};
/**
 * Will aggregate the data passed in to dictionary objects of paths
 * which fire at the root of the listeners/watchers that are currently
 * on the database.
 */
export function groupEventsByWatcher(data, dbSnapshot) {
    data = dotifyKeys(data);
    const getFromSnapshot = (path) => get(dbSnapshot, dotify(path));
    const eventPaths = Object.keys(data).map(i => dotify(i));
    const response = [];
    const relativePath = (full, partial) => {
        return full.replace(partial, "");
    };
    const justKey = (obj) => (obj ? Object.keys(obj)[0] : null);
    const justValue = (obj) => justKey(obj) ? obj[justKey(obj)] : null;
    getListeners().forEach(listener => {
        const eventPathsUnderListener = eventPaths.filter(path => path.includes(dotify(listener.query.path)));
        if (eventPathsUnderListener.length === 0) {
            // if there are no listeners then there's nothing to do
            return;
        }
        const paths = [];
        const listenerPath = dotify(listener.query.path);
        const changeObject = eventPathsUnderListener.reduce((changes, path) => {
            paths.push(path);
            if (dotify(listener.query.path) === path) {
                changes = data[path];
            }
            else {
                set(changes, dotify(relativePath(path, listenerPath)), data[path]);
            }
            return changes;
        }, {});
        const key = listener.eventType === "value"
            ? changeObject
                ? justKey(changeObject)
                : listener.query.path.split(".").pop()
            : dotify(pathJoin(slashify(listener.query.path), justKey(changeObject)));
        const newResponse = {
            listenerId: listener.id,
            listenerPath,
            listenerEvent: listener.eventType,
            callback: listener.callback,
            eventPaths: paths,
            key,
            changes: justValue(changeObject),
            value: listener.eventType === "value"
                ? getDb(listener.query.path)
                : getDb(key),
            priorValue: listener.eventType === "value"
                ? get(dbSnapshot, listener.query.path)
                : justValue(get(dbSnapshot, listener.query.path))
        };
        response.push(newResponse);
    });
    return response;
}
export function removeDB(path) {
    if (!getDb(path)) {
        return;
    }
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
    const valuePlusId = typeof value === "object" ? Object.assign(Object.assign({}, value), { id: pushId }) : value;
    setDB(fullPath, valuePlusId);
    return pushId;
}
/** Clears the DB and removes all listeners */
export function reset() {
    removeAllListeners();
    clearDatabase();
}
//# sourceMappingURL=store.js.map