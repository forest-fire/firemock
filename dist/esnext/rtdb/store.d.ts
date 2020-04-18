import { IDictionary } from "common-types";
import { IMockWatcherGroupEvent } from "../@types/rtdb-types";
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
/** clears the DB without losing reference to DB object */
export declare function clearDatabase(): void;
/**
 * updates the state of the database based on a
 * non-descructive update.
 */
export declare function updateDatabase(updatedState: IDictionary): void;
export declare function auth(): Promise<import("..").IMockAuth>;
export declare function getDb<T = any>(path?: string): any;
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
/**
 * Will aggregate the data passed in to dictionary objects of paths
 * which fire at the root of the listeners/watchers that are currently
 * on the database.
 */
export declare function groupEventsByWatcher(data: IDictionary, dbSnapshot: IDictionary): IMockWatcherGroupEvent[];
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
/** Clears the DB and removes all listeners */
export declare function reset(): void;
