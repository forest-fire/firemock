'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lodash = require('lodash');
var fbKey = require('firebase-key');
var convert = require('typed-conversions');

function normalizeRef(r) {
    r = r.replace("/", ".");
    r = r.slice(0, 1) === "." ? r.slice(1) : r;
    return r;
}
function parts(r) {
    return normalizeRef(r).split(".");
}
/**
 * return the last component of the path
 * which typically would represent the 'id'
 * of a list-node
 */
function leafNode(r) {
    return parts(r).pop();
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Joins a set of paths together and converts into
 * correctly formatted "dot notation" directory path
 */
function join(...paths) {
    return paths
        .map(p => {
        return p.replace(/[\/\\]/gm, ".");
    })
        .map(p => (p.slice(-1) === "." ? p.slice(0, p.length - 1) : p))
        .map(p => (p.slice(0, 1) === "." ? p.slice(1) : p))
        .join(".");
}
function pathDiff(longPath, pathSubset) {
    const subset = pathSubset.split(".");
    const long = longPath.split(".");
    if (subset.length > long.length ||
        JSON.stringify(long.slice(0, subset.length)) !== JSON.stringify(subset)) {
        throw new Error(`"${pathSubset}" is not a subset of ${longPath}`);
    }
    return long.length === subset.length
        ? ""
        : long.slice(subset.length - long.length).join(".");
}
/**
 * Given a path, returns the parent path and child key
 */
function keyAndParent(dotPath) {
    const sections = dotPath.split(".");
    const key = sections.pop();
    const parent = sections.join(".");
    return { parent, key };
}
/** converts a '/' delimited path to a '.' delimited one */
function dotNotation(path) {
    path = path.slice(0, 1) === "/" ? path.slice(1) : path;
    return path ? path.replace(/\//g, ".") : undefined;
}
function slashNotation(path) {
    return path.replace(/\./g, "/");
}
/** Get the parent DB path */
function getParent(dotPath) {
    return keyAndParent(dotPath).parent;
}
/** Get the Key from the end of a path string */
function getKey(dotPath) {
    return keyAndParent(dotPath).key;
}
/** named network delays */
var Delays;
(function (Delays) {
    Delays["random"] = "random";
    Delays["weak"] = "weak-mobile";
    Delays["mobile"] = "mobile";
    Delays["WiFi"] = "WIFI";
})(Delays || (Delays = {}));
let _delay = 5;
function setNetworkDelay(value) {
    _delay = value;
}
function networkDelay(returnValue) {
    return new Promise(resolve => {
        setTimeout(() => {
            if (returnValue) {
                resolve(returnValue);
            }
            else {
                resolve();
            }
        }, calcDelay());
    });
}
function calcDelay() {
    const delay = _delay;
    if (typeof delay === "number") {
        return delay;
    }
    if (Array.isArray(delay)) {
        const [min, max] = delay;
        return getRandomInt(min, max);
    }
    if (typeof delay === "object" && !Array.isArray(delay)) {
        const { min, max } = delay;
        return getRandomInt(min, max);
    }
    // these numbers need some reviewing
    if (delay === "random") {
        return getRandomInt(10, 300);
    }
    if (delay === "weak") {
        return getRandomInt(400, 900);
    }
    if (delay === "mobile") {
        return getRandomInt(300, 500);
    }
    if (delay === "WIFI") {
        return getRandomInt(10, 100);
    }
    throw new Error("Delay property is of unknown format: " + delay);
}

let db = [];
let _listeners = [];
function clearDatabase() {
    db = {};
}
function updateDatabase(state) {
    db = Object.assign({}, db, state);
}
function setDB(path, value) {
    const dotPath = join(path);
    const oldValue = lodash.get(db, dotPath);
    if (value === null) {
        console.log(dotPath);
        removeDB(dotPath);
    }
    else {
        lodash.set(db, dotPath, value);
    }
    notify(dotPath, value, oldValue);
}
/** single-path update */
function updateDB(path, value) {
    const dotPath = join(path);
    const oldValue = lodash.get(db, dotPath);
    const newValue = typeof oldValue === "object" ? Object.assign({}, oldValue, value) : value;
    lodash.set(db, dotPath, newValue);
    notify(dotPath, newValue, oldValue);
}
function multiPathUpdateDB(data) {
    Object.keys(data).map(key => setDB(key, data[key]));
}
function removeDB(path) {
    const dotPath = join(path);
    const oldValue = lodash.get(db, dotPath);
    const parentValue = lodash.get(db, getParent(dotPath));
    if (typeof parentValue === "object") {
        delete parentValue[getKey(dotPath)];
        lodash.set(db, getParent(dotPath), parentValue);
    }
    else {
        lodash.set(db, dotPath, undefined);
    }
    notify(dotPath, undefined, oldValue);
}
function pushDB(path, value) {
    const pushId = fbKey.key();
    const fullPath = join(path, pushId);
    setDB(fullPath, value);
    return pushId;
}
function addListener(path, eventType, callback, cancelCallbackOrContext, context) {
    _listeners.push({
        path: join(path),
        eventType,
        callback,
        cancelCallbackOrContext,
        context
    });
}
function cancelCallback(removed) {
    let count = 0;
    removed.forEach(l => {
        if (typeof l.cancelCallbackOrContext === "function") {
            l.cancelCallbackOrContext();
            count++;
        }
    });
    return count;
}
function removeAllListeners() {
    const howMany = cancelCallback(_listeners);
    _listeners = [];
    return howMany;
}
/**
 * Notifies all appropriate "child" event listeners when changes
 * in state happen
 *
 * @param dotPath the path where the change was made
 * @param newValue the new value
 * @param oldValue the prior value
 */
function notify(dotPath, newValue, oldValue) {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        findValueListeners(dotPath).map(l => {
            let result = {};
            const listeningRoot = lodash.get(db, l.path);
            if (typeof listeningRoot === "object" && !newValue) {
                result = lodash.get(db, l.path);
                delete result[getKey(dotPath)];
            }
            else {
                lodash.set(result, pathDiff(dotPath, l.path), newValue);
            }
            return l.callback(new SnapShot(join(l.path), result));
        });
        if (newValue === undefined) {
            const { parent, key } = keyAndParent(dotPath);
            findChildListeners(parent, "child_removed", "child_changed").forEach(l => {
                return l.callback(new SnapShot(key, newValue));
            });
        }
        else if (oldValue === undefined) {
            const { parent, key } = keyAndParent(dotPath);
            findChildListeners(parent, "child_added", "child_changed").forEach(l => {
                return l.callback(new SnapShot(key, newValue));
            });
        }
    }
}
/**
 * Finds "child events" listening to a given parent path; optionally
 * allowing for specification of the specific event type
 *
 * @param path the parent path that children are detected off of
 * @param eventType <optional> the specific child event to filter down to
 */
function findChildListeners(path, ...eventType) {
    const correctPath = _listeners.filter(l => l.path === join(path) && l.eventType !== "value");
    return eventType.length > 0
        ? correctPath.filter(l => eventType.indexOf(l.eventType) !== -1)
        : correctPath;
}
/**
 * Finds all value listeners on a given path or below.
 * Unlike child listeners, Value listeners listen to changes at
 * all points below the registered path.
 *
 * @param path path to root listening point
 */
function findValueListeners(path) {
    return _listeners.filter(l => join(path).indexOf(join(l.path)) !== -1 && l.eventType === "value");
}
/** Clears the DB and removes all listeners */
function reset$$1() {
    removeAllListeners();
    clearDatabase();
}

class MockHelper {
    constructor(context) {
        this.context = context;
    }
    get faker() {
        const faker = require("faker");
        return faker;
    }
    get chance() {
        const chance = require("chance");
        return chance();
    }
}

/* tslint:disable:max-classes-per-file */
class Mock$$1 {
    constructor(raw) {
        this._schemas = new Queue("schemas").clear();
        this._relationships = new Queue("relationships").clear();
        this._queues = new Queue("queues").clear();
        Queue.clearAll();
        clearDatabase();
        if (raw) {
            this.updateDB(raw);
        }
    }
    /**
     * Update the mock DB with a raw JS object/hash
     */
    updateDB(state) {
        updateDatabase(state);
    }
    getMockHelper() {
        return new MockHelper();
    }
    get db() {
        return db;
    }
    addSchema(schema, mock) {
        const s = new Schema(schema);
        if (mock) {
            s.mock(mock);
        }
        return new Schema(schema);
    }
    /** Set the network delay for queries with "once" */
    setDelay(d) {
        setNetworkDelay(d);
    }
    get deploy() {
        return new Deployment();
    }
    queueSchema(schemaId, quantity = 1, overrides = {}) {
        const d = new Deployment();
        d.queueSchema(schemaId, quantity, overrides);
        return d;
    }
    generate() {
        return new Deployment().generate();
    }
    ref(dbPath) {
        return new Reference(dbPath);
    }
}

class SchemaHelper {
    constructor(raw) {
        this._db = raw;
    }
    get faker() {
        const faker = require("faker");
        return faker;
    }
    get chance() {
        const chance = require("chance");
        return chance();
    }
}

class SnapShot {
    constructor(_key, _value) {
        this._key = _key;
        this._value = _value;
    }
    get key() {
        return getKey(join(this._key));
    }
    get ref() {
        return new Reference(this._key);
    }
    val() {
        return Array.isArray(this._value) ? convert.arrayToHash(this._value) : this._value;
    }
    toJSON() {
        return JSON.stringify(this._value);
    }
    child(path) {
        const value = lodash.get(this._value, path, null);
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

/**
 * Queue Class
 *
 * A generic class for building singleton queues;
 * this is used as a container for schemas, deployment queues,
 * and relationships
 */
class Queue {
    constructor(_name) {
        this._name = _name;
        this.pkProperty = "id";
        if (!_name) {
            throw new Error("A queue MUST have a named passed in to be managed");
        }
        if (!Queue._queues[_name]) {
            Queue._queues[_name] = [];
        }
    }
    static clearAll() {
        Queue._queues = {};
    }
    get name() {
        return this._name;
    }
    /**
     * Allows adding another item to the queue. It is expected
     * that this item WILL have the primary key included ('id' by
     * default)
     */
    enqueue(queueItem) {
        Queue._queues[this._name].push(queueItem);
        return this;
    }
    /**
     * Similar to enqueue but the primary key is generated and passed
     * back to the caller.
     */
    push(queueItem) {
        const id = fbKey.key();
        if (typeof queueItem !== "object") {
            throw new Error("Using push() requires that the payload is an object");
        }
        queueItem[this.pkProperty] = id;
        this.enqueue(queueItem);
        return id;
    }
    /**
     * By passing in the key you will remove the given item from the queue
     */
    dequeue(key) {
        const queue = Queue._queues[this._name];
        if (queue.length === 0) {
            throw new Error(`Queue ${this._name} is empty. Can not dequeue ${key}.`);
        }
        Queue._queues[this._name] =
            typeof lodash.first(queue) === "object"
                ? queue.filter((item) => item[this.pkProperty] !== key)
                : queue.filter((item) => item !== key);
        return this;
    }
    fromArray(payload) {
        Queue._queues[this._name] = payload;
        return this;
    }
    clear() {
        Queue._queues[this._name] = [];
        return this;
    }
    find(key) {
        const [obj, index] = this._find(key);
        return obj;
    }
    indexOf(key) {
        const [obj, index] = this._find(key);
        return index;
    }
    includes(key) {
        return this.find(key) ? true : false;
    }
    replace(key, value) {
        value[this.pkProperty] = key;
        this.dequeue(key).enqueue(value);
        return this;
    }
    update(key, value) {
        const currently = this.find(key);
        if (currently) {
            this.dequeue(key);
        }
        if (typeof currently === "object" && typeof value === "object") {
            value[this.pkProperty] = key;
            const updated = Object.assign({}, currently, value);
            this.enqueue(updated);
        }
        else {
            throw new Error(`Current and updated values must be objects!`);
        }
        return this;
    }
    get length() {
        return Queue._queues[this._name].length;
    }
    /** returns the Queue as a JS array */
    toArray() {
        return Queue._queues && Queue._queues[this._name] ? Queue._queues[this._name] : [];
    }
    /** returns the Queue as a JS Object */
    toHash() {
        const queue = Queue._queues[this._name];
        if (!queue || queue.length === 0) {
            return new Object();
        }
        return typeof lodash.first(queue) === "object"
            ? queue.reduce((obj, item) => {
                const pk = item[this.pkProperty];
                // tslint:disable-next-line
                const o = Object.assign({}, item);
                delete o[this.pkProperty];
                return Object.assign({}, obj, { [pk]: o });
            }, new Object())
            : queue.reduce((obj, item) => (obj = Object.assign({}, obj, { [item]: true })), new Object());
    }
    map(fn) {
        const queuedSchemas = Queue._queues[this._name];
        return queuedSchemas ? queuedSchemas.map(fn) : [];
    }
    filter(fn) {
        const queue = Queue._queues[this._name];
        return queue ? queue.filter(fn) : [];
    }
    toJSON() {
        return JSON.stringify(Queue._queues);
    }
    toObject() {
        return Queue._queues;
    }
    _find(key) {
        const queue = Queue._queues[this._name];
        const objectPayload = typeof lodash.first(queue) === "object";
        let index = 0;
        let result = [null, -1];
        for (const item of queue) {
            const condition = objectPayload ? item[this.pkProperty] === key : item === key;
            if (condition) {
                result = [item, index];
                break;
            }
            index++;
        }
        return result;
    }
}
Queue._queues = {};

var OrderingType;
(function (OrderingType) {
    OrderingType["byChild"] = "child";
    OrderingType["byKey"] = "key";
    OrderingType["byValue"] = "value";
})(OrderingType || (OrderingType = {}));
/** tslint:ignore:member-ordering */
class Query {
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
        console.log(this._limitFilters.length);
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
        const input = lodash.get(db, join(this.path), undefined);
        const hashOfHashes = typeof input === "object" &&
            Object.keys(input).every(i => typeof input[i] === "object");
        console.log(hashOfHashes);
        let snap;
        if (!hashOfHashes) {
            const mockDatabaseResults = convert.keyValueDictionaryToArray(input, {
                key: "id"
            });
            const sorted = this.processSorting(mockDatabaseResults);
            const remainingIds = new Set(this.processFilters(sorted).map((f) => (typeof f === "object" ? f.id : f)));
            const resultset = mockDatabaseResults.filter(i => remainingIds.has(i.id));
            snap = new SnapShot(leafNode(this.path), resultset);
        }
        else {
            const mockDatabaseResults = convert.hashToArray(input);
            const sorted = this.processSorting(mockDatabaseResults);
            const remainingIds = this.processFilters(sorted).map((f) => (typeof f === "object" ? f.id : f));
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
class Reference extends Query {
    get key() {
        return this.path.split(".").pop();
    }
    get parent() {
        const r = parts(this.path)
            .slice(-1)
            .join(".");
        return new Reference(r, lodash.get(db, r));
    }
    child(path) {
        const r = parts(this.path)
            .concat([path])
            .join(".");
        return new Reference(r, lodash.get(db, r));
    }
    get root() {
        return new Reference("/", db);
    }
    push(value, onComplete) {
        const id = pushDB(this.path, value);
        this.path = join(this.path, id);
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay(this); // TODO: try and get this typed appropriately
    }
    remove(onComplete) {
        removeDB(this.path);
        if (onComplete) {
            onComplete(null);
        }
        return networkDelay();
    }
    set(value, onComplete) {
        console.log(value);
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
}

const exceptions = {
    child: 'children',
    man: 'men',
    woman: 'women',
    tooth: 'teeth',
    foot: 'feet',
    mouse: 'mice',
    person: 'people',
    company: 'companies'
};
function pluralize(singular) {
    const rules = [
        { find: /(.*)(ch|sh|ax|ss)$/, replace: '$1$2es' },
        { find: /(.*)(fe|f)$/, replace: '$1ves' },
        { find: /(.*)us$/, replace: '$1i' }
    ];
    for (const r of rules) {
        if (r.find.test(singular)) {
            return singular.replace(r.find, r.replace);
        }
    }
    return exceptions[singular] ? exceptions[singular] : `${singular}s`;
}
const addException = (singular, plural) => {
    exceptions[singular] = plural;
};

class Schema {
    constructor(schemaId) {
        this.schemaId = schemaId;
        this._schemas = new Queue("schemas");
        this._relationships = new Queue("relationships");
        this._prefix = "";
    }
    /**
     * Add a mocking function to be used to generate the schema in mock DB
     */
    mock(cb) {
        this._schemas.enqueue({
            id: this.schemaId,
            fn: cb(new SchemaHelper({})),
            path: () => {
                const schema = this._schemas.find(this.schemaId);
                return [
                    schema.prefix,
                    schema.modelName ? pluralize(schema.modelName) : pluralize(this.schemaId)
                ].join("/");
            }
        });
        return this;
    }
    /**
     * There are times where it's appropriate to have multiple schemas for
     * the same entity/model, in this case you'll want to state what model
     * your schema is emulating. If you don't state this property it assumes
     * the schema name IS the model name
     */
    modelName(value) {
        this._schemas.update(this.schemaId, { modelName: value });
        return this;
    }
    /** prefixes a static path to the beginning of the  */
    pathPrefix(prefix) {
        prefix = prefix.replace(/\./g, "/"); // slash reference preferred over dot
        prefix = prefix.slice(-1) === "/" ? prefix.slice(0, prefix.length - 1) : prefix;
        this._schemas.update(this.schemaId, { prefix });
        return this;
    }
    /**
     * The default pluralizer is quite simple so if you find that
     * it is pluralizing incorrectly then you can manually state
     * the plural name.
     */
    pluralName(plural) {
        const model = this._schemas.find(this.schemaId).modelName
            ? this._schemas.find(this.schemaId).modelName
            : this.schemaId;
        addException(model, plural);
        return this;
    }
    /**
     * Configures a "belongsTo" relationship with another schema/entity
     */
    belongsTo(target, sourceProperty) {
        this._relationships.push({
            type: "belongsTo",
            source: this.schemaId,
            target,
            sourceProperty: sourceProperty ? sourceProperty : `${target}Id`
        });
        return this;
    }
    /**
     * Configures a "hasMany" relationship with another schema/entity
     */
    hasMany(target, sourceProperty) {
        this._relationships.push({
            type: "hasMany",
            source: this.schemaId,
            target,
            sourceProperty: sourceProperty ? sourceProperty : pluralize(target)
        });
        return this;
    }
    /** Add another schema */
    addSchema(schema, mock) {
        const s = new Schema(schema);
        if (mock) {
            s.mock(mock);
        }
        return new Schema(schema);
    }
}

class Deployment {
    constructor() {
        this._queue = new Queue("queue");
        this._schemas = new Queue("schemas");
        this._relationships = new Queue("relationships");
    }
    /**
     * Queue a schema for deployment to the mock DB
     */
    queueSchema(
    /** A unique reference to the schema being queued for generation */
    schemaId, 
    /** The number of this schema to generate */
    quantity = 1, 
    /** Properties in the schema template which should be overriden with a static value */
    overrides = {}) {
        this.schemaId = schemaId;
        this.queueId = fbKey.key();
        const schema = this._schemas.find(schemaId);
        if (!schema) {
            console.log(`Schema "${schema}" does not exist; will SKIP.`);
        }
        else {
            const newQueueItem = {
                id: this.queueId,
                schema: schemaId,
                prefix: schema.prefix,
                quantity,
                overrides
            };
            this._queue.enqueue(newQueueItem);
        }
        return this;
    }
    /**
     * Provides specificity around how many of a given
     * "hasMany" relationship should be fulfilled of
     * the schema currently being queued.
     */
    quantifyHasMany(targetSchema, quantity) {
        const hasMany = this._relationships.filter(r => r.type === "hasMany" && r.source === this.schemaId);
        const targetted = hasMany.filter(r => r.target === targetSchema);
        if (hasMany.length === 0) {
            console.log(`Attempt to quantify "hasMany" relationships with schema "${this.schemaId}" is not possible; no such relationships exist`);
        }
        else if (targetted.length === 0) {
            console.log(`The "${targetSchema}" schema does not have a "hasMany" relationship with the "${this.schemaId}" model`);
        }
        else {
            const queue = this._queue.find(this.queueId);
            this._queue.update(this.queueId, {
                hasMany: Object.assign({}, queue.hasMany, { [pluralize(targetSchema)]: quantity })
            });
        }
        return this;
    }
    /**
     * Indicates the a given "belongsTo" should be fulfilled with a
     * valid FK reference when this queue is generated.
     */
    fulfillBelongsTo(targetSchema) {
        const schema = this._schemas.find(this.schemaId);
        const relationship = lodash.first(this._relationships
            .filter(r => r.source === this.schemaId)
            .filter(r => r.target === targetSchema));
        const sourceProperty = schema.path();
        const queue = this._queue.find(this.queueId);
        this._queue.update(this.queueId, {
            belongsTo: Object.assign({}, queue.belongsTo, { [`${targetSchema}Id`]: true })
        });
        return this;
    }
    generate() {
        this._queue.map((q) => {
            for (let i = q.quantity; i > 0; i--) {
                this.insertMockIntoDB(q.schema, q.overrides);
            }
        });
        this._queue.map((q) => {
            for (let i = q.quantity; i > 0; i--) {
                this.insertRelationshipLinks(q);
            }
        });
        this._queue.clear();
    }
    insertMockIntoDB(schemaId, overrides) {
        const schema = this._schemas.find(schemaId);
        const mock = schema.fn();
        const path = schema.path();
        const key = overrides.id || fbKey.key();
        lodash.set(db, dotNotation(path) + `.${key}`, typeof mock === "object"
            ? Object.assign({}, mock, overrides) : overrides && typeof overrides !== "object"
            ? overrides
            : mock);
        return key;
    }
    insertRelationshipLinks(queue) {
        const relationships = this._relationships.filter(r => r.source === queue.schema);
        const belongsTo = relationships.filter(r => r.type === "belongsTo");
        const hasMany = relationships.filter(r => r.type === "hasMany");
        belongsTo.forEach(r => {
            const fulfill = Object.keys(queue.belongsTo || {})
                .filter(v => queue.belongsTo[v] === true)
                .indexOf(r.sourceProperty) !== -1;
            const source = this._schemas.find(r.source);
            const target = this._schemas.find(r.target);
            let getID;
            if (fulfill) {
                const mockAvailable = this._schemas.find(r.target) ? true : false;
                const available = Object.keys(db[pluralize(r.target)] || {});
                const generatedAvailable = available.length > 0;
                const numChoices = (db[r.target] || []).length;
                const choice = () => generatedAvailable
                    ? available[getRandomInt(0, available.length - 1)]
                    : this.insertMockIntoDB(r.target, {});
                getID = () => mockAvailable
                    ? generatedAvailable
                        ? choice()
                        : this.insertMockIntoDB(r.target, {})
                    : fbKey.key();
            }
            else {
                getID = () => "";
            }
            const property = r.sourceProperty;
            const path = source.path();
            const recordList = lodash.get(db, dotNotation(source.path()), {});
            Object.keys(recordList).forEach(key => {
                lodash.set(db, `${dotNotation(source.path())}.${key}.${property}`, getID());
            });
        });
        hasMany.forEach(r => {
            const fulfill = Object.keys(queue.hasMany || {}).indexOf(r.sourceProperty) !== -1;
            const howMany = fulfill ? queue.hasMany[r.sourceProperty] : 0;
            const source = this._schemas.find(r.source);
            const target = this._schemas.find(r.target);
            let getID;
            if (fulfill) {
                const mockAvailable = this._schemas.find(r.target) ? true : false;
                const available = Object.keys(db[pluralize(r.target)] || {});
                const used = [];
                const generatedAvailable = available.length > 0;
                const numChoices = (db[pluralize(r.target)] || []).length;
                const choice = (pool) => {
                    if (pool.length > 0) {
                        const chosen = pool[getRandomInt(0, pool.length - 1)];
                        used.push(chosen);
                        return chosen;
                    }
                    return this.insertMockIntoDB(r.target, {});
                };
                getID = () => mockAvailable
                    ? choice(available.filter(a => used.indexOf(a) === -1))
                    : fbKey.key();
            }
            else {
                getID = () => undefined;
            }
            const property = r.sourceProperty;
            const path = source.path();
            const sourceRecords = lodash.get(db, dotNotation(source.path()), {});
            Object.keys(sourceRecords).forEach(key => {
                for (let i = 1; i <= howMany; i++) {
                    lodash.set(db, `${dotNotation(source.path())}.${key}.${property}.${getID()}`, true);
                }
            });
        });
    }
}

exports.Mock = Mock$$1;
exports.SchemaHelper = SchemaHelper;
exports.Reference = Reference;
exports.Query = Query;
exports.SnapShot = SnapShot;
exports.Queue = Queue;
exports.Schema = Schema;
exports.Deployment = Deployment;
exports.resetDatabase = reset$$1;
exports.MockHelper = MockHelper;
//# sourceMappingURL=firemock.cjs.js.map
