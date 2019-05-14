// tslint:disable:no-implicit-dependencies
import { IDictionary } from "common-types";
import { IListener } from "./query";
import set from "lodash.set";
import get from "lodash.get";
import { key as fbKey } from "firebase-key";
import { join, pathDiff, getParent, getKey, keyAndParent } from "./util";
import { SnapShot } from "./index";
import { DataSnapshot, EventType } from "@firebase/database-types";
import { auth as mockedAuth } from "./auth";

export type FirebaseDatabase = import("@firebase/database-types").FirebaseDatabase;
export let db: IDictionary = [];

let _listeners: IListener[] = [];

export function clearDatabase() {
  db = {};
}

export function updateDatabase(state: any) {
  db = {
    ...db,
    ...state
  };
}

export async function auth() {
  return mockedAuth();
}

/**
 * **setDB**
 *
 * sets the database at a given path
 */
export function setDB(path: string, value: any) {
  const dotPath = join(path);
  const oldValue = get(db, dotPath);

  if (value === null) {
    removeDB(dotPath);
  } else {
    set(db, dotPath, value);
  }
  notify(dotPath, value, oldValue);
}

/**
 * **updateDB**
 *
 * single-path, non-destructive update to database
 */
export function updateDB<T = any>(path: string, value: T) {
  const dotPath = join(path);
  const oldValue: T = get(db, dotPath);
  const newValue: T = typeof oldValue === "object" ? { ...oldValue, ...value } : value;

  set(db, dotPath, newValue);
  notify(dotPath, newValue, oldValue);
}

/**
 * **multiPathUpdateDB**
 *
 * Emulates a Firebase multi-path update. The keys of the dictionary
 * are _paths_ in the DB, the value is the value to set at that path.
 */
export function multiPathUpdateDB(data: IDictionary) {
  Object.keys(data).map(key => setDB(key, data[key]));
}

export function removeDB(path: string) {
  const dotPath = join(path);
  const oldValue = get(db, dotPath);

  const parentValue: any = get(db, getParent(dotPath));

  if (typeof parentValue === "object") {
    delete parentValue[getKey(dotPath)];
    set(db, getParent(dotPath), parentValue);
  } else {
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
export function pushDB(path: string, value: any): string {
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
export function addListener(
  path: string,
  eventType: EventType,
  callback: (snap: DataSnapshot, key?: string) => void,
  cancelCallbackOrContext?: (err?: Error) => void,
  context?: IDictionary
) {
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
export function removeListener(
  eventType?: EventType,
  callback?: (snap: DataSnapshot, key?: string) => void,
  context?: IDictionary
): number {
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

    _listeners = _listeners.filter(
      l => l.eventType !== eventType || l.callback !== callback
    );

    return cancelCallback(removed);
  } else {
    // if we have context then we can ignore other params
    const removed = _listeners
      .filter(l => l.callback === callback)
      .filter(l => l.eventType === eventType)
      .filter(l => l.context === context);

    _listeners = _listeners.filter(
      l => l.context !== context || l.callback !== callback || l.eventType !== eventType
    );

    return cancelCallback(removed);
  }
}

/**
 * internal function responsible for the actual removal of
 * a listener.
 */
function cancelCallback(removed: IListener[]): number {
  let count = 0;
  removed.forEach(l => {
    if (typeof l.cancelCallbackOrContext === "function") {
      (l.cancelCallbackOrContext as () => any)();
      count++;
    }
  });
  return count;
}

export function removeAllListeners(): number {
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
export function listenerCount(type?: EventType) {
  return type ? _listeners.filter(l => l.eventType === type).length : _listeners.length;
}

export type EventTypePlusChild = EventType | "child";

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
export function listenerPaths(lookFor?: EventTypePlusChild | EventTypePlusChild[]) {
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
export function getListeners(lookFor?: EventTypePlusChild | EventTypePlusChild[]) {
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
function notify<T = any>(path: string, newValue: T, oldValue?: T) {
  // console.log("notify:", path, newValue);

  if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
    findValueListeners(path).map(l => {
      let result: IDictionary = {};
      const listeningRoot = get(db, l.path);
      if (typeof listeningRoot === "object" && !newValue) {
        result = get(db, l.path);
        delete result[getKey(path)];
      } else {
        set(result, pathDiff(path, l.path), newValue);
      }
      return l.callback(new SnapShot(join(l.path), result));
    });

    if (newValue === undefined) {
      const { parent, key } = keyAndParent(path);
      findChildListeners(parent, "child_removed", "child_changed").forEach(l => {
        return l.callback(new SnapShot(key, newValue));
      });
    } else if (oldValue === undefined) {
      const { parent, key } = keyAndParent(path);
      findChildListeners(parent, "child_added", "child_changed").forEach(l => {
        return l.callback(new SnapShot(key, newValue));
      });
    }
  }
}

/**
 * **findChildListeners**
 *
 * Finds "child events" listening to a given _parent path_; optionally
 * allowing for specification of the specific `EventType` or `EventType(s)`.
 *
 * @param path the _parent path_ that children are detected off of
 * @param eventType <optional> the specific child event (or events) to filter down to; if you have more than one then you should be aware that this property is destructured so the calling function should pass in an array of parameters rather than an array as the second parameter
 */
export function findChildListeners(path: string, ...eventType: EventType[]) {
  const correctPath = _listeners.filter(
    l => l.path === join(path) && l.eventType !== "value"
  );

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
export function findValueListeners(path: string) {
  return _listeners.filter(
    l => join(path).indexOf(join(l.path)) !== -1 && l.eventType === "value"
  );
}

/** Clears the DB and removes all listeners */
export function reset() {
  removeAllListeners();
  clearDatabase();
}
