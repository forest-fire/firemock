import { IDictionary } from "common-types";
import Query from "./query";
import { Reference as IReference, ThenableReference as IThenableReference, DataSnapshot } from "@firebase/database-types";
export default class Reference<T = any> extends Query<T> implements IReference {
    readonly key: string | null;
    readonly parent: IReference | null;
    child<C = any>(path: string): Reference;
    readonly root: Reference;
    push(value?: any, onComplete?: (a: Error | null) => any): IThenableReference;
    remove(onComplete?: (a: Error | null) => any): Promise<void>;
    set(value: any, onComplete?: (a: Error | null) => any): Promise<void>;
    update(values: IDictionary, onComplete?: (a: Error | null) => any): Promise<void>;
    setPriority(priority: string | number | null, onComplete: (a: Error | null) => any): Promise<void>;
    setWithPriority(newVal: any, newPriority: string | number | null, onComplete: (a: Error | null) => any): Promise<void>;
    transaction(transactionUpdate: (a: Partial<T>) => Partial<T>, onComplete?: (a: Error | null, b: boolean, c: DataSnapshot | null) => any, applyLocally?: boolean): Promise<{
        committed: boolean;
        snapshot: any;
        toJSON(): {};
    }>;
    onDisconnect(): any;
    toString(): string;
}
