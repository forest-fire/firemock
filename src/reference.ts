import { IDictionary } from 'common-types';
import Query from './query';
import SnapShot from './snapshot';
import Disconnected from './disconnected';
import { get } from 'lodash';
import { db } from './database';
import {
  parts,
  normalizeRef,
  leafNode,
  getRandomInt,
  removeKeys
} from './util';
import * as firebase from 'firebase-admin';

/** named network delays */
export enum Delays {
  random = 'random',
  weak = 'weak-mobile',
  mobile = 'mobile',
  WiFi = 'WIFI'
}

export type QueryValue = number|string|boolean|null;

export type AsyncOrSync<T> = Promise<SnapShot<T>> | SnapShot<T>;
export type DelayType = number | number[] | IDictionary<number> | Delays;
export type Query = (snap: SnapShot) => SnapShot;
export type QueryStack = Query[];
export enum OrderingType {
  byChild = 'child',
  byKey = 'key',
  byValue = 'value'
}
export interface IOrdering {
  type: OrderingType;
  value: any;
}
export default class Reference<T = any>
  extends Query
  implements firebase.database.Reference {
  private _query: QueryStack = [];
  private _order: IOrdering;

  public get parent(): Reference {
    const r = parts(this.path).slice(-1).join('.');
    return new Reference(r, get(db, r));
  }

  public child(path: string): Reference {
    const r = parts(this.path).concat([path]).join('.');
    return new Reference(r, get(db, r));
  }

  public on(
    eventType: firebase.database.EventType,
    callback: (a: SnapShot | null, b?: string) => any,
    cancelCallbackOrContext?: object | null,
    context?: object | null
  ): (a: SnapShot | null, b?: string) => any {
    console.log('on() not implemented yet');
    return null;
  }

  public off() {
    console.log('on() not implemented yet');
  }

  public get root(): firebase.database.Reference {
    return null;
  }

  // TODO: this needs implementing
  public push(value?: any, onComplete?: (a: Error | null) => any) {
    return Promise.resolve(this) as firebase.database.ThenableReference;
  }

  public remove(onComplete?: (a: Error | null) => any): Promise<void> {
    return Promise.resolve();
  }

  public set(value: any, onComplete?: (a: Error | null) => any): Promise<void> {
    return Promise.resolve();
  }

  public update(
    values: IDictionary,
    onComplete?: (a: Error | null) => any
  ): Promise<void> {
    return Promise.resolve();
  }

  public setPriority(
    priority: string | number | null,
    onComplete: (a: Error | null) => any
  ): Promise<void> {
    return Promise.resolve();
  }

  public setWithPriority(
    newVal: any,
    newPriority: string | number | null,
    onComplete: (a: Error | null) => any
  ) {
    return Promise.resolve();
  }

  public transaction(
    transactionUpdate: (a: any) => any,
    onComplete?: (
      a: Error | null,
      b: boolean,
      c: admin.database.DataSnapshot | null
    ) => any,
    applyLocally?: boolean
  ): Promise<{
    committed: boolean;
    snapshot: admin.database.DataSnapshot | null;
  }> {
    return Promise.resolve({
      committed: true,
      snapshot: null
    });
  }

  public onDisconnect(): firebase.database.OnDisconnect {
    return new Disconnected();
  }

  public once(eventType: 'value'): Promise<SnapShot<T>> {
    const snapshot = this._once();
    return new Promise(resolve => {
      setTimeout(() => resolve(snapshot), this.delay());
    });
  }

  public onceSync(eventType: 'value'): SnapShot<T> {
    return this._once();
  }

  public limitToFirst(num: number) {
    this._query.push((snap: SnapShot<T>) => {
      let js: any = snap.val() as T;
      if (typeof js === 'object') {
        const remove = Object.keys(js).slice(num);
        js = removeKeys(js, remove);
      }

      return new SnapShot(snap.key, js);
    });

    return this;
  }

  public limitToLast(num: number) {
    this._query.push((snap: SnapShot<T>) => {
      let js: any = snap.val() as T;
      const size: number = Object.keys(js).length;
      if (typeof js === 'object') {
        const remove = Object.keys(js).slice(0, size - num);
        js = removeKeys(js, remove);
      }

      return new SnapShot(snap.key, js);
    });

    return this;
  }

  public equalTo(value: QueryValue, key?: string) {
    this._query.push((snap: SnapShot<T>) => {
      let js: any = snap.val() as T;
      const remove = Object.keys(js).filter(k => js[k][key] !== value);
      js = removeKeys(js, remove);
      return new SnapShot(snap.key, js);
    });

    return this;
  }

  public startAt(value: QueryValue, key?: string) {
    this._query.push((snap: SnapShot<T>) => {
      let js: any = snap.val() as T;
      const remove = Object.keys(js).filter(k => js[k][key] < value);
      js = removeKeys(js, remove);
      return new SnapShot(snap.key, js);
    });

    return this;
  }

  public endAt(value: QueryValue, key?: string) {
    this._query.push((snap: SnapShot<T>) => {
      let js: any = snap.val() as T;
      const remove = Object.keys(js).filter(k => js[k][key] > value);
      js = removeKeys(js, remove);
      return new SnapShot(snap.key, js);
    });

    return this;
  }

  public orderByChild(path: string) {
    this._order = {
      type: OrderingType.byChild,
      value: path
    };
  }

  public orderByValue() {
    this._order = {
      type: OrderingType.byValue,
      value: null
    };
  }

  public orderByKey() {
    this._order = {
      type: OrderingType.byKey,
      value: null
    };
  }

  private _once(): SnapShot<T> {
    const response = get(db, normalizeRef(this.path), undefined);
    let snapshot: any = new SnapShot<T>(leafNode(this.path), response);
    this._query.forEach(q => (snapshot = q(snapshot)));

    return snapshot as SnapShot<T>;
  }

  private delay() {
    const delay = this._delay as IDictionary | number | number[] | Delays;
    if (typeof delay === 'number') {
      return delay;
    }

    if (Array.isArray(delay)) {
      const [min, max] = delay;
      return getRandomInt(min, max);
    }

    if (typeof delay === 'object' && !Array.isArray(delay)) {
      const { min, max } = delay;
      return getRandomInt(min, max);
    }

    // these numbers need some reviewing
    if (delay === 'random') {
      return getRandomInt(10, 300);
    }
    if (delay === 'weak') {
      return getRandomInt(400, 900);
    }
    if (delay === 'mobile') {
      return getRandomInt(300, 500);
    }
    if (delay === 'WIFI') {
      return getRandomInt(10, 100);
    }

    throw new Error('Delay property is of unknown format: ' + delay);
  }
}
