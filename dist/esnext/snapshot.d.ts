import { IDictionary, SortingFunction } from "common-types";
import Reference from "./reference";
import { DataSnapshot } from "@firebase/database-types";
/**
 * Each record in the forEach iteration will be passed
 * a snapshot synchronously; if you wish to exit early
 * return a TRUE value
 */
export declare type Action = (record: SnapShot) => boolean | void;
export default class SnapShot<T = any> implements DataSnapshot {
    private _key;
    private _value;
    private _sortingFunction;
    constructor(_key: string, _value: T[] | T);
    readonly key: string;
    readonly ref: Reference<T>;
    val(): T | IDictionary<T>;
    toJSON(): string;
    child<TC = IDictionary>(path: string): SnapShot<TC>;
    hasChild(path: string): boolean;
    hasChildren(): boolean;
    numChildren(): number;
    exists(): boolean;
    forEach(actionCb: Action): boolean;
    /** NOTE: mocking proxies this call through to val(), no use of "priority" */
    exportVal(): T | IDictionary<T>;
    getPriority(): string | number | null;
    /**
     * Used by Query objects to instruct the snapshot the sorting function to use
     */
    sortingFunction(fn: SortingFunction): this;
}
