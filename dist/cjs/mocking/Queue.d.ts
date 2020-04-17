import { IDictionary } from "common-types";
export declare type Key = string | number;
/**
 * Queue Class
 *
 * A generic class for building singleton queues;
 * this is used as a container for schemas, deployment queues,
 * and relationships
 */
export declare class Queue<T = any> {
    private _name;
    static clearAll(): void;
    private static _queues;
    pkProperty: string;
    constructor(_name: string);
    get name(): string;
    /**
     * Allows adding another item to the queue. It is expected
     * that this item WILL have the primary key included ('id' by
     * default)
     */
    enqueue(queueItem: T): this;
    /**
     * Similar to enqueue but the primary key is generated and passed
     * back to the caller.
     */
    push(queueItem: any): string;
    /**
     * By passing in the key you will remove the given item from the queue
     */
    dequeue(key: string | number): this;
    fromArray(payload: T[]): this;
    clear(): this;
    find(key: Key): any;
    indexOf(key: Key): any;
    includes(key: Key): boolean;
    replace(key: Key, value: any): this;
    update(key: Key, value: any): this;
    get length(): any;
    /** returns the Queue as a JS array */
    toArray(): any;
    /** returns the Queue as a JS Object */
    toHash(): any;
    map(fn: (f: any) => any): T[];
    filter(fn: (f: any) => any): T[];
    toJSON(): string;
    toObject(): IDictionary<any>;
    private _find;
}
