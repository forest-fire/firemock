import { RtdbQuery, RtdbReference, RtdbDataSnapshot, RtdbEventType, QueryValue, IFirebaseEventHandler } from "../@types/rtdb-types";
import { SerializedQuery } from "serialized-query";
import { DelayType } from "../shared/index";
import { IDictionary } from "common-types";
/** tslint:ignore:member-ordering */
export declare abstract class Query<T = any> implements RtdbQuery {
    path: string;
    protected _query: SerializedQuery;
    protected _delay: DelayType;
    constructor(path: string | SerializedQuery, delay?: DelayType);
    get ref(): RtdbReference;
    limitToLast(num: number): Query<T>;
    limitToFirst(num: number): Query<T>;
    equalTo(value: QueryValue, key?: Extract<keyof T, string>): Query<T>;
    /** Creates a Query with the specified starting point. */
    startAt(value: QueryValue, key?: string): Query<T>;
    endAt(value: QueryValue, key?: string): Query<T>;
    /**
     * Setup an event listener for a given eventType
     */
    on(eventType: RtdbEventType, callback: (a: RtdbDataSnapshot, b?: null | string) => any, cancelCallbackOrContext?: (err?: Error) => void | null, context?: object | null): (a: RtdbDataSnapshot, b?: null | string) => Promise<null>;
    once(eventType: "value"): Promise<RtdbDataSnapshot>;
    off(): void;
    /**
     * Returns a boolean flag based on whether the two queries --
     * _this_ query and the one passed in -- are equivalen in scope.
     */
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
     * order is based on the order of the
     * "key" which is time-based if you are using Firebase's
     * _push-keys_.
     *
     * **Note:** this is the default sort if no sort is specified
     */
    orderByKey(): Query<T>;
    /** NOT IMPLEMENTED */
    orderByPriority(): Query<T>;
    toJSON(): {
        identity: string;
        query: IDictionary<any>;
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
    protected getParent(): RtdbReference | null;
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    protected getRoot(): RtdbReference;
    protected abstract addListener(pathOrQuery: string | SerializedQuery<any>, eventType: RtdbEventType, callback: IFirebaseEventHandler, cancelCallbackOrContext?: (err?: Error) => void, context?: IDictionary): Promise<RtdbDataSnapshot>;
    /**
     * Reduce the dataset using _filters_ (after sorts) but do not apply sort
     * order to new SnapShot (so natural order is preserved)
     */
    private getQuerySnapShot;
}
