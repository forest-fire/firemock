import { IDictionary } from 'common-types';
import { first } from 'lodash';

export default class Queue<T = any> {
  private static _queues: IDictionary = {};
  public pkProperty = 'id';

  constructor(private _name: string) {
    if (!_name) {
      throw new Error('A queue MUST have a named passed in to be managed');
    }

    if (! Queue._queues[_name] ) {
      Queue._queues[_name] = [] as T[];
    } 
  }

  public get name() {
    return this._name;
  }

  public enqueue(queueItem: T) {
    Queue._queues[this._name].push(queueItem);
    return this;
  }

  public dequeue(key: string | number) {
    const queue = Queue._queues[this._name];
    if (queue.length === 0 ) {
      throw new Error(`Queue ${this._name} is empty. Can not dequeue ${key}.`);
    }

    Queue._queues[this._name] = typeof first(queue) === 'object'
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

  public find(key: string | number) {
    const [ obj, index ] = this._find(key);
    return obj;
  }

  public indexOf(key: string | number) {
    const [ obj, index ] = this._find(key);
    return index;
  }

  public includes(key: string | number) {
    return this._find(key) ? true : false;
  }

  public replace(key: string | number, value: T) {
    //
  }

  public get length() {
    return Queue._queues[this._name].length;
  }

  /** returns the Queue as a JS array */
  public toArray() {
    return Queue._queues[this._name];
  }

  /** returns the Queue as a JS Object */
  public toHash() {
    const queue = Queue._queues[this._name];
    if(queue.length === 0) {
      return new Object();
    }

    return (typeof first(queue) === 'object')
      ? queue.reduce(
          (obj, item) => {
            const pk = item[this.pkProperty];
            // tslint:disable-next-line
            const o = Object.assign({}, item);
            delete o[this.pkProperty];
            return { ...obj, ...{ [pk]: o } };
          }, 
          new Object()
        )
      : queue.reduce((obj: IDictionary, item: any) => obj = { ...obj, ...{[item]: true} }, new Object());
  }

  public map(fn: (f: any) => any) {
    const queue = Queue._queues[this._name];
    return queue
      ? queue.map(fn) as T[]
      : undefined;
  }

  private _find(key: string | number) {
    const queue = Queue._queues[this._name];
    const objectPayload = typeof first(queue) === 'object';

    let index = 0;
    let result;
    for(const item of queue) {
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

};
