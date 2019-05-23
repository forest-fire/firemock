import { DataSnapshot, Query as IQuery, EventType, Reference as IReference } from "@firebase/database-types";
import SnapShot from "./snapshot";
import Queue from "./queue";
import Reference from "./reference";
import { DelayType } from "./util";
export declare type EventHandler = HandleValueEvent | HandleNewEvent | HandleRemoveEvent;
export declare type GenericEventHandler = (snap: SnapShot, key?: string) => void;
export declare type HandleValueEvent = (dataSnapShot: SnapShot) => void;
export declare type HandleNewEvent = (childSnapshot: SnapShot, prevChildKey: string) => void;
export declare type HandleRemoveEvent = (oldChildSnapshot: SnapShot) => void;
export declare type HandleMoveEvent = (childSnapshot: SnapShot, prevChildKey: string) => void;
export declare type HandleChangeEvent = (childSnapshot: SnapShot, prevChildKey: string) => void;
export declare type QueryValue = number | string | boolean | null;
export declare enum OrderingType {
    byChild = "child",
    byKey = "key",
    byValue = "value"
}
export interface IOrdering {
    type: OrderingType;
    value: any;
}
export interface IListener {
    path: string;
    eventType: EventType;
    callback: (a: DataSnapshot | null, b?: string) => any;
    cancelCallbackOrContext?: object | null;
    context?: object | null;
}
export declare type IQueryFilter<T> = (resultset: T[]) => T[];
/** tslint:ignore:member-ordering */
export default class Query<T = any> implements IQuery {
    path: string;
    protected _delay: DelayType;
    protected _order: IOrdering;
    protected _listeners: Queue<IListener>;
    protected _limitFilters: Array<IQueryFilter<T>>;
    protected _queryFilters: Array<IQueryFilter<T>>;
    private queryParams_;
    private orderByCalled_;
    constructor(path: string, _delay?: DelayType);
    readonly ref: Reference<T>;
    limitToLast(num: number): Query<T>;
    limitToFirst(num: number): Query<T>;
    equalTo(value: QueryValue, key?: Extract<keyof T, string>): Query<T>;
    /** Creates a Query with the specified starting point. */
    startAt(value: QueryValue, key?: string): Query<T>;
    endAt(value: QueryValue, key?: string): Query<T>;
    on(eventType: EventType, callback: (a: DataSnapshot | null, b?: string) => any, cancelCallbackOrContext?: (err?: Error) => void | null, context?: object | null): (a: DataSnapshot | null, b?: string) => any;
    once(eventType: "value"): Promise<DataSnapshot>;
    off(): void;
    /** NOT IMPLEMENTED YET */
    isEqual(other: Query): boolean;
    /**
     * When the children of a query are all objects, then you can sort them by a
     * specific property. Note: if this happens a lot then it's best to explicitly
     * index on this property in the database's config.
     */
    orderByChild(prop: string): Query<T>;
    /**
     * When the children of a query are all scalar values (string, number, boolean), you
     * can order the results by their (ascending) values
     */
    orderByValue(): Query<T>;
    /**
     * This is the default sort
     */
    orderByKey(): Query<T>;
    /** NOT IMPLEMENTED */
    orderByPriority(): Query<T>;
    toJSON(): {
        identity: string;
        delay: DelayType;
        ordering: IOrdering;
        numListeners: any;
        queryFilters: string | IQueryFilter<T>[];
        limitFilters: string | IQueryFilter<T>[];
    };
    toString(): string;
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    protected getKey(): string | null;
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    protected getParent(): IReference | null;
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    protected getRoot(): IReference;
    /**
     * Reduce the dataset using filters (after sorts) but do not apply sort
     * order to new SnapShot (so natural order is preserved)
     */
    private process;
    /**
     * Processes all Filter Queries to reduce the resultset
     */
    private processFilters;
    private processSorting;
    /**
     * Returns a sorting function for the given Sort Type
     */
    private getSortingFunction;
}
