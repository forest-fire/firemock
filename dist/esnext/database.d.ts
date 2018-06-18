import { IDictionary } from "common-types";
import { rtdb } from "firebase-api-surface";
import { IListener } from "./query";
import { SnapShot } from "./index";
export declare let db: IDictionary;
export declare function clearDatabase(): void;
export declare function updateDatabase(state: any): void;
export declare function setDB(path: string, value: any): void;
/** single-path update */
export declare function updateDB(path: string, value: any): void;
export declare function multiPathUpdateDB(data: IDictionary): void;
export declare function removeDB(path: string): void;
export declare function pushDB(path: string, value: any): string;
export declare function addListener(path: string, eventType: rtdb.EventType, callback: (snap: rtdb.IDataSnapshot, key?: string) => void, cancelCallbackOrContext?: (err?: Error) => void, context?: IDictionary): void;
export declare function removeListener(eventType?: rtdb.EventType, callback?: (snap: SnapShot, key?: string) => void, context?: IDictionary): number;
export declare function removeAllListeners(): number;
export declare function listenerCount(type?: rtdb.EventType): number;
export declare function listenerPaths(type?: rtdb.EventType): string[];
/**
 * Finds "child events" listening to a given parent path; optionally
 * allowing for specification of the specific event type
 *
 * @param path the parent path that children are detected off of
 * @param eventType <optional> the specific child event to filter down to
 */
export declare function findChildListeners(path: string, ...eventType: rtdb.EventType[]): IListener[];
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
