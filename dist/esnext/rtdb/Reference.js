import { setDB, updateDB, pushDB, removeDB, multiPathUpdateDB, SnapShot, addListener, Query } from "../rtdb/index";
import { parts, join, slashNotation, networkDelay } from "../shared/index";
import { SerializedQuery } from "serialized-query";
import { getDb } from "./store";
function isMultiPath(data) {
    Object.keys(data).map((d) => {
        if (!d) {
            data[d] = "/";
        }
    });
    const indexesAreStrings = Object.keys(data).every(i => typeof i === "string");
    const indexesLookLikeAPath = Object.keys(data).every(i => i.indexOf("/") !== -1);
    return indexesAreStrings && indexesLookLikeAPath ? true : false;
}
export class Reference extends Query {
    static createQuery(query, delay = 5) {
        if (typeof query === "string") {
            query = new SerializedQuery(query);
        }
        const obj = new Reference(query.path, delay);
        obj._query = query;
        return obj;
    }
    static create(path) {
        return new Reference(path);
    }
    constructor(path, _delay = 5) {
        super(path, _delay);
    }
    get key() {
        return this.path.split(".").pop();
    }
    get parent() {
        const r = parts(this.path)
            .slice(-1)
            .join(".");
        return new Reference(r, getDb(r));
    }
    child(path) {
        const r = parts(this.path)
            .concat([path])
            .join(".");
        return new Reference(r, getDb(r));
    }
    get root() {
        return new Reference("/", getDb("/"));
    }
    push(value, onComplete) {
        const id = pushDB(this.path, value);
        this.path = join(this.path, id);
        if (onComplete) {
            onComplete(null);
        }
        const ref = networkDelay(this);
        return ref;
    }
    remove(onComplete) {
        removeDB(this.path);
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay();
    }
    set(value, onComplete) {
        setDB(this.path, value);
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay();
    }
    update(values, onComplete) {
        if (isMultiPath(values)) {
            multiPathUpdateDB(values);
        }
        else {
            updateDB(this.path, values);
        }
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay();
    }
    setPriority(priority, onComplete) {
        return networkDelay();
    }
    setWithPriority(newVal, newPriority, onComplete) {
        return networkDelay();
    }
    transaction(transactionUpdate, onComplete, applyLocally) {
        return Promise.resolve({
            committed: true,
            snapshot: null,
            toJSON() {
                return {};
            }
        });
    }
    onDisconnect() {
        return {};
    }
    toString() {
        return this.path
            ? slashNotation(join("FireMock::Reference@", this.path, this.key))
            : "FireMock::Reference@uninitialized (aka, no path) mock Reference object";
    }
    getSnapshot(key, value) {
        return new SnapShot(key, value);
    }
    addListener(pathOrQuery, eventType, callback, cancelCallbackOrContext, context) {
        return addListener(pathOrQuery, eventType, callback, cancelCallbackOrContext, context);
    }
}
//# sourceMappingURL=Reference.js.map