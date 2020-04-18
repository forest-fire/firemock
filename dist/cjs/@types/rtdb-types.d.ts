import { IDictionary } from "common-types";
import { SerializedQuery } from "serialized-query";
import { ISchemaHelper } from "./mocking-types";
export declare type RtdbQuery = import("@firebase/database-types").Query;
export declare type RtdbReference = import("@firebase/database-types").Reference;
export declare type RtdbDataSnapshot = import("@firebase/database-types").DataSnapshot;
export declare type RtdbThenableReference = import("@firebase/database-types").ThenableReference;
export declare type RtdbEventType = import("@firebase/database-types").EventType;
export declare type FirebaseDatabase = import("@firebase/database-types").FirebaseDatabase;
export interface ISchema {
    id: string;
    /** path to the database which is the root for given schema list */
    path: () => string;
    /** mock generator function */
    fn: () => IDictionary;
    /**
     * the name of the entity being mocked, if not set then schema name
     * is assume to equal model name
     */
    modelName?: string;
    /** a static path that preceeds this schema's placement in the database */
    prefix?: string;
}
export interface IRelationship {
    id: string;
    /** cardinality type */
    type: "hasMany" | "belongsTo";
    /** the source model */
    source: string;
    /**
     * the property on the source model which is the FK
     * (by default it will use standard naming conventions)
     */
    sourceProperty: string;
    /** the model being referred to in the source model's FK */
    target: string;
}
/** Queued up schema's ready for generation */
export interface IQueue {
    id: string;
    schema: string;
    quantity: number;
    hasMany?: IDictionary<number>;
    overrides?: IDictionary;
    prefix: string;
    /** the key refers to the property name, the value true means "fulfill" */
    belongsTo?: IDictionary<boolean>;
}
/** A Schema's mock callback generator must conform to this type signature */
export declare type SchemaCallback<T = any> = (helper: ISchemaHelper<T>) => () => T;
/**
 * Captures a CRUD event
 */
export interface IMockWatcherGroupEvent {
    /** the unique identifier of the listener */
    listenerId: string;
    /** the path that the listener is listening at */
    listenerPath: string;
    /** the event which is being listened to */
    listenerEvent: import("@firebase/database-types").EventType;
    /** the dispatch function for this listener */
    callback: IFirebaseEventHandler;
    /** the path where the event took place */
    eventPaths: string[];
    /** the "key" of the event; this applied to value AND child events */
    key: string;
    /** changes between value and priorValue */
    changes: any;
    /** the new value which has been set */
    value: any;
    /** the prior value that this property held previous to the event */
    priorValue: any;
}
/**
 * A change event which is fired from Firebase; the specific signature
 * of the event depends on the event type being fired.
 *
 * events: [API Spec](https://firebase.google.com/docs/reference/node/firebase.database.Reference#on)
 *
 * @param snap the DBRtdbDataSnapshot which provides access to the root of the `on` event;
 * in the case of a _removal_ you will get snapshot of the prior value
 * @param prevChildKey provided on `child_changed`, `child_moved`, and `child_added`; gives the
 * name of the key which directly _preceeds_ the event key in Firebase's stored order
 */
export interface IFirebaseEventHandler {
    (snap: RtdbDataSnapshot, prevChildKey?: string): void;
}
export declare type EventHandler = HandleValueEvent | HandleNewEvent | HandleRemoveEvent;
export declare type GenericEventHandler = (snap: RtdbDataSnapshot, key?: string) => void;
export declare type HandleValueEvent = (dataSnapShot: RtdbDataSnapshot) => void;
export declare type HandleNewEvent = (childSnapshot: RtdbDataSnapshot, prevChildKey: string) => void;
export declare type HandleRemoveEvent = (oldChildSnapshot: RtdbDataSnapshot) => void;
export declare type HandleMoveEvent = (childSnapshot: RtdbDataSnapshot, prevChildKey: string) => void;
export declare type HandleChangeEvent = (childSnapshot: RtdbDataSnapshot, prevChildKey: string) => void;
export declare type QueryValue = number | string | boolean | null;
export interface IListener {
    /** random string */
    id: string;
    /** the _query_ the listener is based off of */
    query: SerializedQuery;
    eventType: RtdbEventType;
    callback: (a: RtdbDataSnapshot | null, b?: string) => any;
    cancelCallbackOrContext?: object | null;
    context?: object | null;
}
