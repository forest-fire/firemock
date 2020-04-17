import { IDictionary } from "common-types";
import { RtdbReference, RtdbDataSnapshot, RtdbThenableReference, RtdbEventType, IFirebaseEventHandler } from "../@types/rtdb-types";
import { SnapShot, Query } from "./index";
import { DelayType } from "../shared/util";
import { SerializedQuery } from "serialized-query";
export declare class Reference<T = any> extends Query<T> implements RtdbReference {
    static createQuery(query: string | SerializedQuery, delay?: DelayType): Reference<any>;
    static create(path: string): Reference<any>;
    constructor(path: string, _delay?: DelayType);
    get key(): string | null;
    get parent(): RtdbReference | null;
    child<C = any>(path: string): Reference;
    get root(): Reference;
    push(value?: any, onComplete?: (a: Error | null) => any): RtdbThenableReference;
    remove(onComplete?: (a: Error | null) => any): Promise<void>;
    set(value: any, onComplete?: (a: Error | null) => any): Promise<void>;
    update(values: IDictionary, onComplete?: (a: Error | null) => any): Promise<void>;
    setPriority(priority: string | number | null, onComplete: (a: Error | null) => any): Promise<void>;
    setWithPriority(newVal: any, newPriority: string | number | null, onComplete: (a: Error | null) => any): Promise<void>;
    transaction(transactionUpdate: (a: Partial<T>) => Partial<T>, onComplete?: (a: Error | null, b: boolean, c: RtdbDataSnapshot | null) => any, applyLocally?: boolean): Promise<{
        committed: boolean;
        snapshot: any;
        toJSON(): {};
    }>;
    onDisconnect(): any;
    toString(): string;
    protected getSnapshotConstructor<T extends RtdbDataSnapshot>(key: string, value: any): SnapShot<T>;
    protected addListener(pathOrQuery: string | SerializedQuery<any>, eventType: RtdbEventType, callback: IFirebaseEventHandler, cancelCallbackOrContext?: (err?: Error) => void, context?: IDictionary): Promise<RtdbDataSnapshot>;
}
