// tslint:disable:no-implicit-dependencies
import { IDictionary, pathJoin } from "common-types";
import set from "lodash.set";
import get from "lodash.get";
import { key as fbKey } from "firebase-key";
import { deepEqual } from "fast-equals";
import copy from "fast-copy";
import deepmerge from "deepmerge";

import { auth as mockedAuth } from "../auth";
import { IMockWatcherGroupEvent } from "../@types/rtdb-types";
import { join, getParent, getKey, dotifyKeys, dotify } from "../shared/index";
import { getListeners, removeAllListeners, notify } from "../rtdb/index";

/**
 * The in-memory dictionary/hash mantained by the mock RTDB to represent
 * the state of the database
 */
let db: IDictionary = {};

let _silenceEvents: boolean = false;

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
export function updateDatabase(updatedState: IDictionary) {
  db = deepmerge(db, updatedState);
}

export async function auth() {
  return mockedAuth();
}

export function getDb<T = any>(path?: string) {
  return path ? get(db, dotify(path)) : db;
}

/**
 * **setDB**
 *
 * sets the database at a given path
 */
export function setDB(path: string, value: any, silent: boolean = false) {
  const dotPath = join(path);
  const oldRef = get(db, dotPath);
  const oldValue = typeof oldRef === "object" ? { ...oldRef, ...{} } : oldRef;
  const isReference = ["object", "array"].includes(typeof value);
  const dbSnapshot = copy({ ...db });

  // ignore if no change
  if (
    (isReference && deepEqual(oldValue, value)) ||
    (!isReference && oldValue === value)
  ) {
    return;
  }

  if (value === null) {
    const parentValue: any = get(db, getParent(dotPath));
    if (typeof parentValue === "object") {
      delete parentValue[getKey(dotPath)];

      set(db, getParent(dotPath), parentValue);
    } else {
      set(db, dotPath, undefined);
    }
  } else {
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
export function updateDB<T = any>(path: string, value: T) {
  const dotPath = join(path);
  const oldValue: T = get(db, dotPath);
  let changed = true;
  if (
    typeof value === "object" &&
    Object.keys(value).every(
      k =>
        (oldValue ? (oldValue as IDictionary)[k] : null) ===
        (value as IDictionary)[k]
    )
  ) {
    changed = false;
  }

  if (typeof value !== "object" && value === oldValue) {
    changed = false;
  }

  if (!changed) {
    return;
  }

  const newValue: T =
    typeof oldValue === "object" ? { ...oldValue, ...value } : value;

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
export function multiPathUpdateDB(data: IDictionary) {
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

const slashify = (path: string) => {
  const slashPath = path.replace(/\./g, "/");
  return slashPath.slice(0, 1) === "/" ? slashPath.slice(1) : slashPath;
};

/**
 * Will aggregate the data passed in to dictionary objects of paths
 * which fire at the root of the listeners/watchers that are currently
 * on the database.
 */
export function groupEventsByWatcher(
  data: IDictionary,
  dbSnapshot: IDictionary
): IMockWatcherGroupEvent[] {
  data = dotifyKeys(data);

  const getFromSnapshot = (path: string) => get(dbSnapshot, dotify(path));
  const eventPaths = Object.keys(data).map(i => dotify(i));

  const response: IMockWatcherGroupEvent[] = [];
  const relativePath = (full: string, partial: string) => {
    return full.replace(partial, "");
  };

  const justKey = (obj: IDictionary) => (obj ? Object.keys(obj)[0] : null);
  const justValue = (obj: IDictionary) =>
    justKey(obj) ? obj[justKey(obj)] : null;

  getListeners().forEach(listener => {
    const eventPathsUnderListener = eventPaths.filter(path =>
      path.includes(dotify(listener.query.path))
    );

    if (eventPathsUnderListener.length === 0) {
      // if there are no listeners then there's nothing to do
      return;
    }

    const paths: string[] = [];

    const listenerPath = dotify(listener.query.path);
    const changeObject = eventPathsUnderListener.reduce(
      (changes: IDictionary<IMockWatcherGroupEvent>, path) => {
        paths.push(path);
        if (dotify(listener.query.path) === path) {
          changes = data[path];
        } else {
          set(changes, dotify(relativePath(path, listenerPath)), data[path]);
        }

        return changes;
      },
      {}
    );

    const key: string =
      listener.eventType === "value"
        ? changeObject
          ? justKey(changeObject)
          : listener.query.path.split(".").pop()
        : dotify(
            pathJoin(slashify(listener.query.path), justKey(changeObject))
          );

    const newResponse = {
      listenerId: listener.id,
      listenerPath,
      listenerEvent: listener.eventType,
      callback: listener.callback,
      eventPaths: paths,
      key,
      changes: justValue(changeObject),
      value:
        listener.eventType === "value"
          ? getDb(listener.query.path)
          : getDb(key),
      priorValue:
        listener.eventType === "value"
          ? get(dbSnapshot, listener.query.path)
          : justValue(get(dbSnapshot, listener.query.path))
    };

    response.push(newResponse);
  });

  return response;
}

export function removeDB(path: string) {
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
export function pushDB(path: string, value: any): string {
  const pushId = fbKey();
  const fullPath = join(path, pushId);
  const valuePlusId =
    typeof value === "object" ? { ...value, id: pushId } : value;

  setDB(fullPath, valuePlusId);
  return pushId;
}

/** Clears the DB and removes all listeners */
export function reset() {
  removeAllListeners();
  clearDatabase();
}
