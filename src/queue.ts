import { IDictionary } from 'common-types';

export default class Queue<T = any> {
  private static _queues: IDictionary<T[]> = {};

  constructor(private _type: string) {
    if (! Queue._queues[_type] ) {
      Queue._queues[_type] = [] as T;
    }
  }

  public enqueue(queueItem: T) {
    Queue._queue[_type].push(queueItem);
  }

  public dequeue(key: string) {
    Queue._queue[_type] = Queue._queue[_type].filter(item => item.id !== key);
  }

  public clear() {
    Queue._queue[_type] = [];
  }

};
