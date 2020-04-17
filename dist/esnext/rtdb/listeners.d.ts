import { SerializedQuery } from "serialized-query";
import { RtdbEventType, IFirebaseEventHandler, RtdbDataSnapshot, IListener } from "../@types/rtdb-types";
import { IDictionary } from "common-types";
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
export declare function addListener(pathOrQuery: string | SerializedQuery<any>, eventType: RtdbEventType, callback: IFirebaseEventHandler, cancelCallbackOrContext?: (err?: Error) => void, context?: IDictionary): Promise<RtdbDataSnapshot>;
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
export declare function removeListener(eventType?: RtdbEventType, callback?: (snap: RtdbDataSnapshot, key?: string) => void, context?: IDictionary): number;
export declare function removeAllListeners(): number;
/**
 * **listenerCount**
 *
 * Provides a numberic count of listeners on the database.
 * Optionally you can state the `EventType` and get a count
 * of only this type of event.
 */
export declare function listenerCount(type?: RtdbEventType): number;
export declare type EventTypePlusChild = RtdbEventType | "child";
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
/**
 * **notify**
 *
 * Based on a dictionary of paths/values it reduces this to events to
 * send to zero or more listeners.
 */
export declare function notify<T = any>(data: IDictionary, dbSnapshot: IDictionary): void;
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
export declare function findChildListeners(changePath: string, ...eventTypes: RtdbEventType[]): IListenerPlus[];
/**
 * Finds all value listeners on a given path or below.
 * Unlike child listeners, Value listeners listen to changes at
 * all points below the registered path.
 *
 * @param path path to root listening point
 */
export declare function findValueListeners(path: string): IListener[];
