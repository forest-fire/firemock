import { rtdb } from "firebase-api-surface";
import { IDictionary } from "common-types";
import Query from "./query";
export default class Reference<T = any> extends Query<T> implements rtdb.IReference {
    readonly key: string | null;
    readonly parent: rtdb.IReference | null;
    child<C = any>(path: string): rtdb.IReference;
    readonly root: rtdb.IReference;
    push(value?: any, onComplete?: (a: Error | null) => any): rtdb.IThenableReference<rtdb.IReference<T>>;
    remove(onComplete?: (a: Error | null) => any): Promise<void>;
    set(value: any, onComplete?: (a: Error | null) => any): Promise<void>;
    update(values: IDictionary, onComplete?: (a: Error | null) => any): Promise<void>;
    setPriority(priority: string | number | null, onComplete: (a: Error | null) => any): Promise<void>;
    setWithPriority(newVal: any, newPriority: string | number | null, onComplete: (a: Error | null) => any): Promise<void>;
    transaction(transactionUpdate: (a: Partial<T>) => Partial<T>, onComplete?: (a: Error | null, b: boolean, c: rtdb.IDataSnapshot<T> | null) => any, applyLocally?: boolean): Promise<rtdb.ITransactionResult>;
    onDisconnect(): any;
    toString(): string;
}
