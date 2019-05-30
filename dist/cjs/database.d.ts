import { IDictionary } from "common-types";
import { IListener } from "./query";
import { DataSnapshot, EventType } from "@firebase/database-types";
import { IFirebaseEventHandler } from "./types";
export declare type FirebaseDatabase = import("@firebase/database-types").FirebaseDatabase;
export declare let db: IDictionary;
/**
 * silences the database from sending events;
 * this is not typically done but can be done
 * as part of the Mocking process to reduce noise
 */
export declare function silenceEvents(): void;
/**
 * returns the database to its default state of sending
 * events out.
 */
export declare function restoreEvents(): void;
export declare function shouldSendEvents(): boolean;
export declare function clearDatabase(): void;
export declare function updateDatabase(state: any): void;
export declare function auth(): Promise<import(".").IMockAuth>;
export declare function getDb(path: string): any;
/**
 * **setDB**
 *
 * sets the database at a given path
 */
export declare function setDB(path: string, value: any, silent?: boolean): void;
/**
 * **updateDB**
 *
 * single-path, non-destructive update to database
 */
export declare function updateDB<T = any>(path: string, value: T): void;
/**
 * **multiPathUpdateDB**
 *
 * Emulates a Firebase multi-path update. The keys of the dictionary
 * are _paths_ in the DB, the value is the value to set at that path.
 *
 * **Note:** dispatch notifations must not be done at _path_ level but
 * instead grouped up by _watcher_ level.
 */
export declare function multiPathUpdateDB(data: IDictionary): void;
export declare function removeDB(path: string): void;
/**
 * **pushDB**
 *
 * Push a new record into the mock database. Uses the
 * `firebase-key` library to generate the key which
 * attempts to use the same algorithm as Firebase
 * itself.
 */
export declare function pushDB(path: string, value: any): string;
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
export declare function addListener(path: string, eventType: EventType, callback: IFirebaseEventHandler, cancelCallbackOrContext?: (err?: Error) => void, context?: IDictionary): void;
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
export declare function removeListener(eventType?: EventType, callback?: (snap: DataSnapshot, key?: string) => void, context?: IDictionary): number;
export declare function removeAllListeners(): number;
/**
 * **listenerCount**
 *
 * Provides a numberic count of listeners on the database.
 * Optionally you can state the `EventType` and get a count
 * of only this type of event.
 */
export declare function listenerCount(type?: EventType): number;
export declare type EventTypePlusChild = EventType | "child";
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
export declare function listenerPaths(lookFor?: EventTypePlusChild | EventTypePlusChild[]): string[];
/**
 * **getListeners**
 *
 * Returns the list of listeners.Optionally you can state the `EventType` and
 * filter down to only this type of event or "set of events".
 *
 * You can also just state "child" as the event and it will resolve to all child
 * events: `[ 'child_added', 'child_changed', 'child_removed', 'child_moved' ]`
 */
export declare function getListeners(lookFor?: EventTypePlusChild | EventTypePlusChild[]): IListener[];
export declare type IListenerPlus = IListener & {
    id: string;
    changeIsAtRoot: boolean;
};
/**
 * **findChildListeners**
 *
 * Finds "child events" listening to a given _parent path_; optionally
 * allowing for specification of the specific `EventType` or `EventType(s)`.
 *
 * @param changePath the _parent path_ that children are detected off of
 * @param eventTypes <optional> the specific child event (or events) to filter down to; if you have more than one then you should be aware that this property is destructured so the calling function should pass in an array of parameters rather than an array as the second parameter
 */
export declare function findChildListeners(changePath: string, ...eventTypes: EventType[]): IListenerPlus[];
/**
 * Finds all value listeners on a given path or below.
 * Unlike child listeners, Value listeners listen to changes at
 * all points below the registered path.
 *
 * @param path path to root listening point
 */
export declare function findValueListeners(path: string): IListener[];
/** Clears the DB and removes all listeners */
export declare function reset(): void;
