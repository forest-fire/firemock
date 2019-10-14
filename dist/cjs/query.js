"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const lodash_get_1 = __importDefault(require("lodash.get"));
const snapshot_1 = __importDefault(require("./snapshot"));
const queue_1 = __importDefault(require("./queue"));
const convert = __importStar(require("typed-conversions"));
const reference_1 = __importDefault(require("./reference"));
const util_1 = require("./util");
var OrderingType;
(function (OrderingType) {
    OrderingType["byChild"] = "child";
    OrderingType["byKey"] = "key";
    OrderingType["byValue"] = "value";
})(OrderingType = exports.OrderingType || (exports.OrderingType = {}));
/** tslint:ignore:member-ordering */
class Query {
    constructor(path, _delay = 5) {
        this.path = path;
        this._delay = _delay;
        this._order = { type: OrderingType.byKey, value: null };
        this._listeners = new queue_1.default("listeners");
        this._limitFilters = [];
        this._queryFilters = [];
    }
    static deserialize(q) {
        const obj = new Query(q.path);
        q.identity.orderBy;
        return obj;
    }
    get ref() {
        return new reference_1.default(this.path, this._delay);
    }
    limitToLast(num) {
        const filter = resultset => {
            return resultset.slice(resultset.length - num);
        };
        this._limitFilters.push(filter);
        return this;
    }
    limitToFirst(num) {
        const filter = resultset => {
            return resultset.slice(0, num);
        };
        this._limitFilters.push(filter);
        return this;
    }
    equalTo(value, key) {
        if (key && this._order.type === OrderingType.byKey) {
            throw new Error("You can not use equalTo's key property when using a key sort!");
        }
        key = key ? key : this._order.value;
        const filter = (resultset) => {
            let comparison = item => item[key];
            if (!key) {
                switch (this._order.type) {
                    case OrderingType.byChild:
                        comparison = item => item[this._order.value];
                        break;
                    case OrderingType.byKey:
                        comparison = item => item.id;
                        break;
                    case OrderingType.byValue:
                        comparison = item => item;
                        break;
                    default:
                        throw new Error("unknown ordering type: " + this._order.type);
                }
            }
            return resultset.filter((item) => comparison(item) === value);
        };
        this._queryFilters.push(filter);
        return this;
    }
    /** Creates a Query with the specified starting point. */
    startAt(value, key) {
        key = key ? key : this._order.value;
        const filter = resultset => {
            return resultset.filter((record) => {
                return key ? record[key] >= value : record >= value;
            });
        };
        this._queryFilters.push(filter);
        return this;
    }
    endAt(value, key) {
        key = key ? key : this._order.value;
        const filter = resultset => {
            return resultset.filter((record) => {
                return key ? record[key] <= value : record <= value;
            });
        };
        this._queryFilters.push(filter);
        return this;
    }
    /**
     * Setup an event listener for a given eventType
     */
    on(eventType, callback, cancelCallbackOrContext, context) {
        database_1.addListener(this.path, eventType, callback, cancelCallbackOrContext, context);
        return null;
    }
    once(eventType) {
        return util_1.networkDelay(this.process());
    }
    off() {
        console.log("off() not implemented yet");
    }
    /** NOT IMPLEMENTED YET */
    isEqual(other) {
        return false;
    }
    /**
     * When the children of a query are all objects, then you can sort them by a
     * specific property. Note: if this happens a lot then it's best to explicitly
     * index on this property in the database's config.
     */
    orderByChild(prop) {
        this._order = {
            type: OrderingType.byChild,
            value: prop
        };
        return this;
    }
    /**
     * When the children of a query are all scalar values (string, number, boolean), you
     * can order the results by their (ascending) values
     */
    orderByValue() {
        this._order = {
            type: OrderingType.byValue,
            value: null
        };
        return this;
    }
    /**
     * This is the default sort
     */
    orderByKey() {
        this._order = {
            type: OrderingType.byKey,
            value: null
        };
        return this;
    }
    /** NOT IMPLEMENTED */
    orderByPriority() {
        return this;
    }
    toJSON() {
        return {
            identity: this.toString(),
            delay: this._delay,
            ordering: this._order,
            numListeners: this._listeners.length,
            queryFilters: this._queryFilters.length > 0 ? this._queryFilters : "none",
            limitFilters: this._limitFilters.length > 0 ? this._limitFilters : "none"
        };
    }
    toString() {
        return `FireMock::Query@${process.env.FIREBASE_DATA_ROOT_URL}/${this.path}`;
    }
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    getKey() {
        return null;
    }
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    getParent() {
        return null;
    }
    /**
     * This is an undocumented API endpoint that is within the
     * typing provided by Google
     */
    getRoot() {
        return null;
    }
    /**
     * Reduce the dataset using _filters_ (after sorts) but do not apply sort
     * order to new SnapShot (so natural order is preserved)
     */
    process() {
        // typically a hash/object but could be a scalar type (string/number/boolean)
        const input = lodash_get_1.default(database_1.db, util_1.join(this.path), undefined);
        /**
         * Flag to indicate whether the path is of the query points to a Dictionary
         * of Objects. This is indicative of a **Firemodel** list node.
         */
        const hashOfHashes = typeof input === "object" &&
            Object.keys(input).every(i => typeof input[i] === "object");
        let snap;
        if (!hashOfHashes) {
            if (typeof input !== "object") {
                // TODO: is this right? should it not be the FULL path?
                return new snapshot_1.default(util_1.leafNode(this.path), input);
            }
            const mockDatabaseResults = convert.keyValueDictionaryToArray(input, { key: "id" });
            const sorted = this.processSorting(mockDatabaseResults);
            const remainingIds = new Set(this.processFilters(sorted).map((f) => typeof f === "object" ? f.id : f));
            const resultset = mockDatabaseResults.filter(i => remainingIds.has(i.id));
            snap = new snapshot_1.default(util_1.leafNode(this.path), convert.keyValueArrayToDictionary(resultset, { key: "id" }));
        }
        else {
            const mockDatabaseResults = convert.hashToArray(input);
            const sorted = this.processSorting(mockDatabaseResults);
            const remainingIds = this.processFilters(sorted).map((f) => typeof f === "object" ? f.id : f);
            snap = new snapshot_1.default(util_1.leafNode(this.path), mockDatabaseResults.filter((record) => remainingIds.indexOf(record.id) !== -1));
        }
        snap.sortingFunction(this.getSortingFunction(this._order));
        return snap;
    }
    /**
     * Processes all Query _filters_ (equalTo, startAt, endAt)
     */
    processFilters(inputArray) {
        let output = inputArray.slice(0);
        this._queryFilters.forEach(q => (output = q(output)));
        this._limitFilters.forEach(q => (output = q(output)));
        return output;
    }
    processSorting(inputArray) {
        const sortFn = this.getSortingFunction(this._order);
        const sorted = inputArray.slice(0).sort(sortFn);
        return sorted;
    }
    /**
     * Returns a sorting function for the given Sort Type
     */
    getSortingFunction(sortType) {
        let sort;
        switch (sortType.type) {
            case OrderingType.byKey:
                sort = (a, b) => {
                    return a.id > b.id ? -1 : a.id === b.id ? 0 : 1;
                };
                break;
            case OrderingType.byValue:
                sort = (a, b) => {
                    return a.value > b.value ? -1 : a.value === b.value ? 0 : 1;
                };
                break;
            case OrderingType.byChild:
                const child = this._order.value;
                sort = (a, b) => {
                    return a[child] > b[child] ? -1 : a[child] === b[child] ? 0 : 1;
                };
                break;
        }
        return sort;
    }
}
exports.default = Query;
//# sourceMappingURL=query.js.map