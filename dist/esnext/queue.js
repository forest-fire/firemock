import { first } from "lodash";
import * as fbKey from "firebase-key";
/**
 * Queue Class
 *
 * A generic class for building singleton queues;
 * this is used as a container for schemas, deployment queues,
 * and relationships
 */
export default class Queue {
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
            typeof first(queue) === "object"
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
        return typeof first(queue) === "object"
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
        const objectPayload = typeof first(queue) === "object";
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
