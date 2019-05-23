import { db, addListener } from "./database";
import get from "lodash.get";
import SnapShot from "./snapshot";
import Queue from "./queue";
import * as convert from "typed-conversions";
import Reference from "./reference";
import { join, leafNode, networkDelay } from "./util";
export var OrderingType;
(function (OrderingType) {
    OrderingType["byChild"] = "child";
    OrderingType["byKey"] = "key";
    OrderingType["byValue"] = "value";
})(OrderingType || (OrderingType = {}));
/** tslint:ignore:member-ordering */
export default class Query {
    constructor(path, _delay = 5) {
        this.path = path;
        this._delay = _delay;
        this._order = { type: OrderingType.byKey, value: null };
        this._listeners = new Queue("listeners");
        this._limitFilters = [];
        this._queryFilters = [];
    }
    get ref() {
        return new Reference(this.path, this._delay);
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
    on(eventType, callback, cancelCallbackOrContext, context) {
        addListener(this.path, eventType, callback, cancelCallbackOrContext, context);
        return null;
    }
    once(eventType) {
        return networkDelay(this.process());
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
     * Reduce the dataset using filters (after sorts) but do not apply sort
     * order to new SnapShot (so natural order is preserved)
     */
    process() {
        // typically a hash/object but could be a scalar type (string/number/boolean)
        const input = get(db, join(this.path), undefined);
        const hashOfHashes = typeof input === "object" &&
            Object.keys(input).every(i => typeof input[i] === "object");
        let snap;
        if (!hashOfHashes) {
            if (typeof input !== "object") {
                return new SnapShot(leafNode(this.path), input);
            }
            const mockDatabaseResults = convert.keyValueDictionaryToArray(input, {
                key: "id"
            });
            const sorted = this.processSorting(mockDatabaseResults);
            const remainingIds = new Set(this.processFilters(sorted).map((f) => (typeof f === "object" ? f.id : f)));
            const resultset = mockDatabaseResults.filter(i => remainingIds.has(i.id));
            snap = new SnapShot(leafNode(this.path), convert.keyValueArrayToDictionary(resultset, { key: "id" }));
        }
        else {
            const mockDatabaseResults = convert.hashToArray(input);
            const sorted = this.processSorting(mockDatabaseResults);
            const remainingIds = this.processFilters(sorted).map((f) => typeof f === "object" ? f.id : f);
            snap = new SnapShot(leafNode(this.path), mockDatabaseResults.filter((record) => remainingIds.indexOf(record.id) !== -1));
        }
        snap.sortingFunction(this.getSortingFunction(this._order));
        return snap;
    }
    /**
     * Processes all Filter Queries to reduce the resultset
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
//# sourceMappingURL=query.js.map