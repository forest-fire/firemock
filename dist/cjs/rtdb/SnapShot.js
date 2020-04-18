"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_get_1 = __importDefault(require("lodash.get"));
const index_1 = require("../rtdb/index");
const typed_conversions_1 = require("typed-conversions");
const index_2 = require("../shared/index");
class SnapShot {
    constructor(_key, _value) {
        this._key = _key;
        this._value = _value;
    }
    get key() {
        return index_2.getKey(index_2.join(this._key));
    }
    get ref() {
        return new index_1.Reference(this._key);
    }
    val() {
        return Array.isArray(this._value) ? typed_conversions_1.arrayToHash(this._value) : this._value;
    }
    toJSON() {
        return JSON.stringify(this._value);
    }
    child(path) {
        const value = lodash_get_1.default(this._value, path, null);
        return value ? new SnapShot(path, value) : null;
    }
    hasChild(path) {
        if (typeof this._value === "object") {
            return Object.keys(this._value).indexOf(path) !== -1;
        }
        return false;
    }
    hasChildren() {
        if (typeof this._value === "object") {
            return Object.keys(this._value).length > 0;
        }
        return false;
    }
    numChildren() {
        if (typeof this._value === "object") {
            return Object.keys(this._value).length;
        }
        return 0;
    }
    exists() {
        return this._value !== null;
    }
    forEach(actionCb) {
        const cloned = this._value.slice(0);
        const sorted = cloned.sort(this._sortingFunction);
        sorted.map((item) => {
            const noId = Object.assign({}, item);
            delete noId.id;
            const halt = actionCb(new SnapShot(item.id, noId));
            if (halt) {
                return true;
            }
        });
        return false;
    }
    /** NOTE: mocking proxies this call through to val(), no use of "priority" */
    exportVal() {
        return this.val();
    }
    getPriority() {
        return null;
    }
    /**
     * Used by Query objects to instruct the snapshot the sorting function to use
     */
    sortingFunction(fn) {
        this._sortingFunction = fn;
        return this;
    }
}
exports.SnapShot = SnapShot;
//# sourceMappingURL=SnapShot.js.map