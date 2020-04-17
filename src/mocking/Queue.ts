import { IDictionary } from "common-types";
import first from "lodash.first";
import * as fbKey from "firebase-key";

export type Key = string | number;

/**
 * Queue Class
 *
 * A generic class for building singleton queues;
 * this is used as a container for schemas, deployment queues,
 * and relationships
 */
export class Queue<T = any> {
  public static clearAll() {
    Queue._queues = {};
  }
  private static _queues: IDictionary = {};
  public pkProperty = "id";

  constructor(private _name: string) {
    if (!_name) {
      throw new Error("A queue MUST have a named passed in to be managed");
    }

    if (!Queue._queues[_name]) {
      Queue._queues[_name] = [] as T[];
    }
  }

  public get name() {
    return this._name;
  }

  /**
   * Allows adding another item to the queue. It is expected
   * that this item WILL have the primary key included ('id' by
   * default)
   */
  public enqueue(queueItem: T) {
    Queue._queues[this._name].push(queueItem);
    return this;
  }

  /**
   * Similar to enqueue but the primary key is generated and passed
   * back to the caller.
   */
  public push(queueItem: any) {
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
  public dequeue(key: string | number) {
    const queue = Queue._queues[this._name];
    if (queue.length === 0) {
      throw new Error(`Queue ${this._name} is empty. Can not dequeue ${key}.`);
    }

    Queue._queues[this._name] =
      typeof first(queue) === "object"
        ? queue.filter((item: any) => item[this.pkProperty] !== key)
        : queue.filter((item: any) => item !== key);

    return this;
  }

  public fromArray(payload: T[]) {
    Queue._queues[this._name] = payload;
    return this;
  }

  public clear() {
    Queue._queues[this._name] = [];
    return this;
  }

  public find(key: Key) {
    const [obj, index] = this._find(key);
    return obj;
  }

  public indexOf(key: Key) {
    const [obj, index] = this._find(key);
    return index;
  }

  public includes(key: Key) {
    return this.find(key) ? true : false;
  }

  public replace(key: Key, value: any) {
    value[this.pkProperty] = key;
    this.dequeue(key).enqueue(value as T);

    return this;
  }

  public update(key: Key, value: any) {
    const currently: any = this.find(key);
    if (currently) {
      this.dequeue(key);
    }
    if (typeof currently === "object" && typeof value === "object") {
      value[this.pkProperty] = key;
      const updated = { ...(currently as any), ...(value as any) };
      this.enqueue(updated as T);
    } else {
      throw new Error(`Current and updated values must be objects!`);
    }

    return this;
  }

  public get length() {
    return Queue._queues[this._name].length;
  }

  /** returns the Queue as a JS array */
  public toArray() {
    return Queue._queues && Queue._queues[this._name]
      ? Queue._queues[this._name]
      : [];
  }

  /** returns the Queue as a JS Object */
  public toHash() {
    const queue = Queue._queues[this._name];
    if (!queue || queue.length === 0) {
      return new Object();
    }

    return typeof first(queue) === "object"
      ? queue.reduce((obj: IDictionary, item: any) => {
          const pk: string = item[this.pkProperty];
          // tslint:disable-next-line
          const o = Object.assign({}, item);
          delete o[this.pkProperty];
          return { ...obj, ...{ [pk]: o } };
        }, new Object())
      : queue.reduce(
          (obj: IDictionary, item: any) =>
            (obj = { ...obj, ...{ [item]: true } }),
          new Object()
        );
  }

  public map(fn: (f: any) => any): T[] {
    const queuedSchemas = Queue._queues[this._name];
    return queuedSchemas ? (queuedSchemas.map(fn) as T[]) : [];
  }

  public filter(fn: (f: any) => any) {
    const queue = Queue._queues[this._name];
    return queue ? (queue.filter(fn) as T[]) : [];
  }

  public toJSON() {
    return JSON.stringify(Queue._queues);
  }

  public toObject() {
    return Queue._queues;
  }

  private _find(key: string | number) {
    const queue = Queue._queues[this._name];
    const objectPayload = typeof first(queue) === "object";

    let index = 0;
    let result: any[] = [null, -1];
    for (const item of queue) {
      const condition = objectPayload
        ? item[this.pkProperty] === key
        : item === key;
      if (condition) {
        result = [item, index];
        break;
      }
      index++;
    }

    return result;
  }
}
