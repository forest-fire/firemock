import { IDictionary } from "common-types";
export default class Disconnected /** implements firebase.database.OnDisconnect */ {
    cancel(onComplete?: (a: Error) => any): Promise<void>;
    remove(onComplete?: (a: Error) => any): Promise<void>;
    set(value: any, onComplete?: (a: Error | null) => any): Promise<void>;
    setWithPriority(value: any, priority: number | string | null, onComplete?: (a: Error | null) => any): Promise<void>;
    update(values: IDictionary, onComplete?: (a: Error | null) => any): Promise<void>;
}
