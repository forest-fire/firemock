"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const query_1 = __importDefault(require("./query"));
const lodash_get_1 = __importDefault(require("lodash.get"));
const database_1 = require("./database");
const util_1 = require("./util");
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
class Reference extends query_1.default {
    get key() {
        return this.path.split(".").pop();
    }
    get parent() {
        const r = util_1.parts(this.path)
            .slice(-1)
            .join(".");
        return new Reference(r, lodash_get_1.default(database_1.db, r));
    }
    child(path) {
        const r = util_1.parts(this.path)
            .concat([path])
            .join(".");
        return new Reference(r, lodash_get_1.default(database_1.db, r));
    }
    get root() {
        return new Reference("/", database_1.db);
    }
    push(value, onComplete) {
        const id = database_1.pushDB(this.path, value);
        this.path = util_1.join(this.path, id);
        if (onComplete) {
            onComplete(null);
        }
        // TODO: try and get this typed appropriately
        return util_1.networkDelay(this);
    }
    remove(onComplete) {
        database_1.removeDB(this.path);
        if (onComplete) {
            onComplete(null);
        }
        return util_1.networkDelay();
    }
    set(value, onComplete) {
        database_1.setDB(this.path, value);
        if (onComplete) {
            onComplete(null);
        }
        return util_1.networkDelay();
    }
    update(values, onComplete) {
        if (isMultiPath(values)) {
            database_1.multiPathUpdateDB(values);
        }
        else {
            database_1.updateDB(this.path, values);
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
}
exports.default = Reference;
//# sourceMappingURL=reference.js.map