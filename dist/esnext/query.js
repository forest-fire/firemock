import { addListener, getDb } from "./database";
import SnapShot from "./snapshot";
import Reference from "./reference";
import { SerializedQuery, QueryOrderType } from "serialized-query";
import { join, leafNode, networkDelay } from "./util";
import { runQuery } from "./shared/runQuery";
/** tslint:ignore:member-ordering */
export default class Query {
    constructor(path, _delay = 5) {
        this.path = path;
        this._delay = _delay;
        this._query = SerializedQuery.path(path);
    }
    /**
     * A static initializer which returns a **Firemock** `Query`
     * that has been configured with a `SerializedQuery`.
     *
     * @param query the _SerializedQuery_ to configure with
     */
    static create(query) {
        query.setPath(join(query.path)); // ensures dot notation
        const obj = new Query(query.path);
        obj._query = query;
        return obj;
    }
    get ref() {
        return new Reference(this.path, this._delay);
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
        if (key && this._query.identity.orderBy === QueryOrderType.orderByKey) {
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
        addListener(this._query, eventType, callback, cancelCallbackOrContext, context);
        return null;
    }
    once(eventType) {
        return networkDelay(this.getQuerySnapShot());
    }
    off() {
        console.log("off() not implemented yet");
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
            query: this._query.identity
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
        const data = getDb(this._query.path);
        const results = runQuery(this._query, data);
        return new SnapShot(leafNode(this._query.path), results);
    }
}
//# sourceMappingURL=query.js.map