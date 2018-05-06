import { IDictionary } from "common-types";
// tslint:disable-next-line:no-implicit-dependencies
import { rtdb } from "firebase-api-surface";
import { db, addListener, removeListener } from "./database";
import get = require("lodash.get");
import SnapShot from "./snapshot";
import Queue from "./queue";
import * as convert from "typed-conversions";
import Reference from "./reference";
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
} from "./util";

export type EventHandler = HandleValueEvent | HandleNewEvent | HandleRemoveEvent;
export type GenericEventHandler = (snap: SnapShot, key?: string) => void;
export type HandleValueEvent = (dataSnapShot: SnapShot) => void;
export type HandleNewEvent = (childSnapshot: SnapShot, prevChildKey: string) => void;
export type HandleRemoveEvent = (oldChildSnapshot: SnapShot) => void;
export type HandleMoveEvent = (childSnapshot: SnapShot, prevChildKey: string) => void;
export type HandleChangeEvent = (childSnapshot: SnapShot, prevChildKey: string) => void;

export type QueryValue = number | string | boolean | null;
export enum OrderingType {
  byChild = "child",
  byKey = "key",
  byValue = "value"
}

export interface IOrdering {
  type: OrderingType;
  value: any;
}

export interface IListener {
  path: string;

  eventType: rtdb.EventType;
  callback: (a: rtdb.IDataSnapshot | null, b?: string) => any;
  cancelCallbackOrContext?: object | null;
  context?: object | null;
}

export type IQueryFilter<T> = (resultset: T[]) => T[];

/** tslint:ignore:member-ordering */
export default class Query<T = any> implements rtdb.IQuery {
  protected _order: IOrdering = { type: OrderingType.byKey, value: null };
  protected _listeners = new Queue<IListener>("listeners");
  protected _limitFilters: Array<IQueryFilter<T>> = [];
  protected _queryFilters: Array<IQueryFilter<T>> = [];
  private queryParams_: any;
  private orderByCalled_: any;

  constructor(public path: string, protected _delay: DelayType = 5) { }

  public get ref(): rtdb.IReference {
    return new Reference<T>(this.path, this._delay);
  }

  public limitToLast(num: number) {
    const filter: IQueryFilter<T> = resultset => {
      return resultset.slice(resultset.length - num);
    };
    this._limitFilters.push(filter);

    return this;
  }

  public limitToFirst(num: number) {
    const filter: IQueryFilter<T> = resultset => {
      return resultset.slice(0, num);
    };
    this._limitFilters.push(filter);

    return this;
  }

  public equalTo(value: QueryValue, key?: keyof T) {
    if (key && this._order.type === OrderingType.byKey) {
      throw new Error("You can not use equalTo's key property when using a key sort!");
    }
    key = key ? key : this._order.value;

    const filter: IQueryFilter<T> = (resultset: T[]) => {
      let comparison: (item: any) => any = item => item[key];
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
      return resultset.filter((item: any) => comparison(item) === value) as T[];
    };
    this._queryFilters.push(filter);

    return this;
  }

  public startAt(value: QueryValue, key?: string) {
    key = key ? key : this._order.value;
    const filter: IQueryFilter<T> = resultset => {
      return resultset.filter((record: any) => {
        return key ? record[key] >= value : record >= value;
      });
    };
    this._queryFilters.push(filter);

    return this;
  }

  public endAt(value: QueryValue, key?: string) {
    key = key ? key : this._order.value;
    const filter: IQueryFilter<T> = resultset => {
      return resultset.filter((record: any) => {
        return key ? record[key] <= value : record <= value;
      });
    };
    this._queryFilters.push(filter);
    return this;
  }

  public on(
    eventType: rtdb.EventType,
    callback: (a: rtdb.IDataSnapshot<T> | null, b?: string) => any,
    cancelCallbackOrContext?: (err?: Error) => void | null,
    context?: object | null
  ): (a: rtdb.IDataSnapshot | null, b?: string) => any {
    addListener(this.path, eventType, callback, cancelCallbackOrContext, context);
    if (eventType === "value") {
      const current = this.onceSync("value");
      if (current && current.val()) {
        networkDelay(null).then(() => callback(current));
      }
    }
    return callback;
  }

  public once(eventType: "value"): Promise<rtdb.IDataSnapshot<T>> {
    return networkDelay(this.process());
  }

  public onceSync(eventType: "value"): rtdb.IDataSnapshot<T> {
    return this.process();
  }

  public off(
    eventType?: rtdb.EventType,
    callback?: (a: rtdb.IDataSnapshot<T> | null, b?: string) => any,
    context?: object | null): void {
    removeListener(this.path, eventType, callback, context);
  }

  /** NOT IMPLEMENTED YET */
  public isEqual(other: rtdb.IQuery) {
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
   * This is an undocumented API endpoint that is within the
   * typing provided by Google
   */
  protected getKey(): string | null {
    return null;
  }
  /**
   * This is an undocumented API endpoint that is within the
   * typing provided by Google
   */
  protected getParent(): rtdb.IReference | null {
    return null;
  }
  /**
   * This is an undocumented API endpoint that is within the
   * typing provided by Google
   */
  protected getRoot(): rtdb.IReference {
    return null;
  }

  /**
   * Reduce the dataset using filters (after sorts) but do not apply sort
   * order to new SnapShot (so natural order is preserved)
   */
  private process(): SnapShot<T> {
    // typically a hash/object but could be a JS native type (string/number/boolean)
    const input = get(db, join(this.path), undefined);
    let snap;
    if (typeof input !== "object") {
      snap = new SnapShot<T>(leafNode(this.path), input);
    } else {
      const mockDatabaseResults: any[] = convert.hashToArray(input);
      const sorted: any[] = this.processSorting(mockDatabaseResults);
      const remainingIds = this.processFilters(sorted).map(
        (f: any) => (typeof f === "object" ? f.id : f)
      );
      snap = new SnapShot<T>(
        leafNode(this.path),
        mockDatabaseResults.filter((record: any) => remainingIds.indexOf(record.id) !== -1)
      );
    }

    snap.sortingFunction(this.getSortingFunction(this._order));
    return snap;
  }

  /**
   * Processes all Filter Queries to reduce the resultset
   */
  private processFilters(inputArray: T[]): T[] {
    let output = inputArray.slice(0);
    this._queryFilters.forEach(q => (output = q(output)));
    this._limitFilters.forEach(q => (output = q(output)));

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
