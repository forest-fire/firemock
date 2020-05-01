"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../rtdb/index");
const serialized_query_1 = require("serialized-query");
const index_2 = require("../shared/index");
const index_3 = require("../shared/index");
/** tslint:ignore:member-ordering */
class Query {
    constructor(path, delay = 5) {
        this.path = (typeof path === "string"
            ? path
            : serialized_query_1.SerializedQuery.path);
        this._delay = delay;
        this._query = typeof path === "string" ? serialized_query_1.SerializedQuery.path(path) : path;
    }
    get ref() {
        return this;
    }
    limitToLast(num) {
        this._query.limitToLast(num);
        return this;
    }
    limitToFirst(num) {
        this._query.limitToFirst(num);
        return this;
    }
    equalTo(value, key) {
        if (key && this._query.identity.orderBy === serialized_query_1.QueryOrderType.orderByKey) {
            throw new Error(`You can not use "equalTo(val, key)" with a "key" property defined when using a key sort!`);
        }
        this._query.equalTo(value, key);
        return this;
    }
    /** Creates a Query with the specified starting point. */
    startAt(value, key) {
        this._query.startAt(value, key);
        return this;
    }
    endAt(value, key) {
        this._query.endAt(value, key);
        return this;
    }
    /**
     * Setup an event listener for a given eventType
     */
    on(eventType, callback, cancelCallbackOrContext, context) {
        this.addListener(this._query, eventType, callback, cancelCallbackOrContext, context);
        return null;
    }
    async once(eventType) {
        await index_2.networkDelay();
        return this.getQuerySnapShot();
    }
    off() {
        console.log("off() not implemented yet on Firemock");
    }
    /**
     * Returns a boolean flag based on whether the two queries --
     * _this_ query and the one passed in -- are equivalen in scope.
     */
    isEqual(other) {
        return this._query.hashCode() === other._query.hashCode();
    }
    /**
     * When the children of a query are all objects, then you can sort them by a
     * specific property. Note: if this happens a lot then it's best to explicitly
     * index on this property in the database's config.
     */
    orderByChild(prop) {
        this._query.orderByChild(prop);
        return this;
    }
    /**
     * When the children of a query are all scalar values (string, number, boolean), you
     * can order the results by their (ascending) values
     */
    orderByValue() {
        this._query.orderByValue();
        return this;
    }
    /**
     * order is based on the order of the
     * "key" which is time-based if you are using Firebase's
     * _push-keys_.
     *
     * **Note:** this is the default sort if no sort is specified
     */
    orderByKey() {
        this._query.orderByKey();
        return this;
    }
    /** NOT IMPLEMENTED */
    orderByPriority() {
        return this;
    }
    toJSON() {
        return {
            identity: this.toString(),
            query: this._query.identity,
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
    getQuerySnapShot() {
        const path = this._query.path || this.path;
        const data = index_1.getDb(path);
        const results = index_3.runQuery(this._query, data);
        return new index_1.SnapShot(index_2.leafNode(this._query.path), results ? results : null);
    }
}
exports.Query = Query;
//# sourceMappingURL=Query.js.map