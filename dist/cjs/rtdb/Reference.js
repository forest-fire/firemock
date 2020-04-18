"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../rtdb/index");
const index_2 = require("../shared/index");
const serialized_query_1 = require("serialized-query");
const store_1 = require("./store");
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
class Reference extends index_1.Query {
    static createQuery(query, delay = 5) {
        if (typeof query === "string") {
            query = new serialized_query_1.SerializedQuery(query);
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
        const r = index_2.parts(this.path)
            .slice(-1)
            .join(".");
        return new Reference(r, store_1.getDb(r));
    }
    child(path) {
        const r = index_2.parts(this.path)
            .concat([path])
            .join(".");
        return new Reference(r, store_1.getDb(r));
    }
    get root() {
        return new Reference("/", store_1.getDb("/"));
    }
    push(value, onComplete) {
        const id = index_1.pushDB(this.path, value);
        this.path = index_2.join(this.path, id);
        if (onComplete) {
            onComplete(null);
        }
        const ref = index_2.networkDelay(this);
        return ref;
    }
    remove(onComplete) {
        index_1.removeDB(this.path);
        if (onComplete) {
            onComplete(null);
        }
        return index_2.networkDelay();
    }
    set(value, onComplete) {
        index_1.setDB(this.path, value);
        if (onComplete) {
            onComplete(null);
        }
        return index_2.networkDelay();
    }
    update(values, onComplete) {
        if (isMultiPath(values)) {
            index_1.multiPathUpdateDB(values);
        }
        else {
            index_1.updateDB(this.path, values);
        }
        if (onComplete) {
            onComplete(null);
        }
        return index_2.networkDelay();
    }
    setPriority(priority, onComplete) {
        return index_2.networkDelay();
    }
    setWithPriority(newVal, newPriority, onComplete) {
        return index_2.networkDelay();
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
            ? index_2.slashNotation(index_2.join("FireMock::Reference@", this.path, this.key))
            : "FireMock::Reference@uninitialized (aka, no path) mock Reference object";
    }
    getSnapshot(key, value) {
        return new index_1.SnapShot(key, value);
    }
    addListener(pathOrQuery, eventType, callback, cancelCallbackOrContext, context) {
        return index_1.addListener(pathOrQuery, eventType, callback, cancelCallbackOrContext, context);
    }
}
exports.Reference = Reference;
//# sourceMappingURL=Reference.js.map