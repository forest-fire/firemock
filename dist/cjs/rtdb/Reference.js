"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_get_1 = __importDefault(require("lodash.get"));
const rtdb_1 = require("../rtdb");
const util_1 = require("../shared/util");
const serialized_query_1 = require("serialized-query");
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
class Reference extends rtdb_1.Query {
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
        const r = util_1.parts(this.path)
            .slice(-1)
            .join(".");
        return new Reference(r, lodash_get_1.default(rtdb_1.db, r));
    }
    child(path) {
        const r = util_1.parts(this.path)
            .concat([path])
            .join(".");
        return new Reference(r, lodash_get_1.default(rtdb_1.db, r));
    }
    get root() {
        return new Reference("/", rtdb_1.db);
    }
    push(value, onComplete) {
        const id = rtdb_1.pushDB(this.path, value);
        this.path = util_1.join(this.path, id);
        if (onComplete) {
            onComplete(null);
        }
        const ref = util_1.networkDelay(this);
        return ref;
    }
    remove(onComplete) {
        rtdb_1.removeDB(this.path);
        if (onComplete) {
            onComplete(null);
        }
        return util_1.networkDelay();
    }
    set(value, onComplete) {
        rtdb_1.setDB(this.path, value);
        if (onComplete) {
            onComplete(null);
        }
        return util_1.networkDelay();
    }
    update(values, onComplete) {
        if (isMultiPath(values)) {
            rtdb_1.multiPathUpdateDB(values);
        }
        else {
            rtdb_1.updateDB(this.path, values);
        }
        if (onComplete) {
            onComplete(null);
        }
        return util_1.networkDelay();
    }
    setPriority(priority, onComplete) {
        return util_1.networkDelay();
    }
    setWithPriority(newVal, newPriority, onComplete) {
        return util_1.networkDelay();
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
            ? util_1.slashNotation(util_1.join("FireMock::Reference@", this.path, this.key))
            : "FireMock::Reference@uninitialized (aka, no path) mock Reference object";
    }
    getSnapshot(key, value) {
        return new rtdb_1.SnapShot(key, value);
    }
    addListener(pathOrQuery, eventType, callback, cancelCallbackOrContext, context) {
        return rtdb_1.addListener(pathOrQuery, eventType, callback, cancelCallbackOrContext, context);
    }
}
exports.Reference = Reference;
//# sourceMappingURL=Reference.js.map