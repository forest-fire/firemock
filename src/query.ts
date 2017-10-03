import { IDictionary } from 'common-types';
import * as firebase from 'firebase-admin';
import { db, addListener } from './database';
import { get } from 'lodash';
import SnapShot from './snapshot';
import Queue from './queue';
import * as convert from 'typed-conversions';
import Reference from './reference';
import {
  parts,
  join,
  leafNode,
  getRandomInt,
  removeKeys,
  DelayType,
  Delays,
  networkDelay,
  setNetworkDelay
} from './util';

export type EventHandler = HandleValueEvent | HandleNewEvent | HandleRemoveEvent;
export type GenericEventHandler = (snap: SnapShot, key?: string) => void;
export type HandleValueEvent = (dataSnapShot: SnapShot) => void;
export type HandleNewEvent = (childSnapshot: SnapShot, prevChildKey: string) => void;
export type HandleRemoveEvent = (oldChildSnapshot: SnapShot) => void;
export type HandleMoveEvent = (childSnapshot: SnapShot, prevChildKey: string) => void;
export type HandleChangeEvent = (childSnapshot: SnapShot, prevChildKey: string) => void;

export type QueryValue = number|string|boolean|null;
export enum OrderingType {
  byChild = 'child',
  byKey = 'key',
  byValue = 'value'
}

export interface IOrdering {
  type: OrderingType;
  value: any;
}

export interface IListener {
  path: string,

  eventType: firebase.database.EventType,
  callback: (a: firebase.database.DataSnapshot | null, b?: string) => any,
  cancelCallbackOrContext?: object | null,
  context?: object | null
}

export type IQueryFilter<T> = (resultset: T[]) => T[];

/** tslint:ignore:member-ordering */
export default class Query<T = any> implements firebase.database.Query {
  protected _order: IOrdering = { type: OrderingType.byKey, value: null };
  protected _listeners = new Queue<IListener>('listeners');
  protected _limitFilters: Array<IQueryFilter<T>> = [];
  protected _queryFilters: Array<IQueryFilter<T>> = [];

  constructor(public path: string, protected _delay: DelayType = 5) {}



  public get ref(): firebase.database.Reference {
    return new Reference<T>(this.path, this._delay);
  }

  public limitToLast(num: number) {
    const filter: IQueryFilter<T> = (resultset) => {
      return resultset.slice(resultset.length - num);
    };
    this._limitFilters.push(filter);

    return this;
  }

  public limitToFirst(num: number) {
    const filter: IQueryFilter<T> = (resultset) => {
      return resultset.slice(0, num);
    };
    this._limitFilters.push(filter);

    return this;
  }

  public equalTo(value: QueryValue, key?: keyof T) {
    if(key && this._order.type === OrderingType.byKey) {
      throw new Error('You can not use equalTo\'s key property when using a key sort!');
    }

    const filter: IQueryFilter<T> = (resultset: T[]) => {
      let comparison: (item: any) => any = (item) => item[key];
      if(!key) {
        switch(this._order.type) {
          case OrderingType.byChild:
          comparison = (item) => item[this._order.value];
          break;
          case OrderingType.byKey:
          comparison = (item) => item.id;
          break;
          case OrderingType.byValue:
          comparison = (item) => item;
          break;

          default:
          throw new Error('unknown ordering type: ' + this._order.type);
        }
      }
      return resultset.filter((item: any) => comparison(item) === value) as T[];
    }
    this._queryFilters.push(filter);

    return this;
  }

  public startAt(value: QueryValue, key?: string) {
    const filter: IQueryFilter<T> = (resultset) => {
      return resultset.filter((record: any) => {
        return key
        ? record[key] >= value
        : record >= value
      });
    };
    this._queryFilters.push(filter);

    return this;
  }

  public endAt(value: QueryValue, key?: string) {
    const filter: IQueryFilter<T> = (resultset) => {
      return resultset.filter((record: any) => {
        return key
        ? record[key] <= value
        : record <= value
      });
    };
    this._queryFilters.push(filter);

    return this;
  }

  public on(
    eventType: firebase.database.EventType,
    callback: (a: firebase.database.DataSnapshot | null, b?: string) => any,
    cancelCallbackOrContext?: (err?: Error) => void | null,
    context?: object | null
  ): (a: firebase.database.DataSnapshot | null, b?: string) => any {

    addListener(
      this.path,
      eventType,
      callback,
      cancelCallbackOrContext,
      context
    );

    return null;
  }

  public once(eventType: 'value') {
    return networkDelay(this.process()) as Promise<SnapShot<T>>;
  }

  public onceSync(eventType: 'value'): SnapShot<T> {
    return this.process();
  }

  public off() {
    console.log('off() not implemented yet');
  }

  /** NOT IMPLEMENTED YET */
  public isEqual(other: firebase.database.Query) {
    return false;
  }

  /**
   * When the children of a query are all objects, then you can sort them by a
   * specific property. Note: if this happens a lot then it's best to explicitly
   * index on this property in the database's config.
   */
  public orderByChild(prop: string) {
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
  public orderByValue() {
    this._order = {
      type: OrderingType.byValue,
      value: null
    };

    return this;
  }

  /**
   * This is the default sort
   */
  public orderByKey() {
    this._order = {
      type: OrderingType.byKey,
      value: null
    };

    return this;
  }

  /** NOT IMPLEMENTED */
  public orderByPriority() {
    return this;
  }

  public toJSON() {
    return JSON.stringify(this);
  }

  public toString() {
    return `${process.env.FIREBASE_DATA_ROOT_URL}/${this.path}`;
  }

  /**
   * Reduce the dataset using filters (after sorts) but do not apply sort
   * order to new SnapShot (so natural order is preserved)
   */
  private process(): SnapShot<T> {
    const mockDatabaseResults: any[] = convert.hashToArray(
      get(db, join(this.path), undefined)
    );
    const sorted: any[] = this.processSorting(mockDatabaseResults);
    const remainingIds = this.processFilters(sorted).map((f: any) => f.id);
    const snap = new SnapShot<T>(
      leafNode(this.path),
      mockDatabaseResults.filter((record: any) => remainingIds.indexOf(record.id) !== -1)
    );
    snap.sortingFunction(this.getSortingFunction(this._order));
    return snap;
  }

  /**
   * Processes all Filter Queries to reduce the resultset
   */
  private processFilters(inputArray: T[]): T[] {
    let output = inputArray.slice(0);
    this._queryFilters.forEach(q => output = q(output));
    this._limitFilters.forEach(q => output = q(output));

    return output as T[];
  }

  private processSorting(inputArray: T[]): T[] {
    const sortFn = this.getSortingFunction(this._order);
    const sorted = inputArray.slice(0).sort(sortFn);

    return sorted;
  }

  /**
   * Returns a sorting function for the given Sort Type
   */
  private getSortingFunction(sortType: any) {
    let sort: (a: any, b: any) => number;
    switch (sortType.type) {
      case OrderingType.byKey:
        sort = (a, b) => {
          return a.id > b.id
            ? -1
            : a.id === b.id
              ? 0
              : 1;
            };
        break;
      case OrderingType.byValue:
        sort = (a, b) => {
          return a.value > b.value
            ? -1
            : a.value === b.value
              ? 0
              : 1;
            };
        break;
      case OrderingType.byChild:
        const child = this._order.value;
        sort = (a, b) => {
          return a[child] > b[child]
            ? -1
            : a[child] === b[child]
              ? 0
              : 1;
            };
        break;
    }

    return sort;
  }
}
