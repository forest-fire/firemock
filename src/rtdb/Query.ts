import {
  DataSnapshot,
  Query as IQuery,
  EventType,
  Reference as IReference
} from "@firebase/database-types";
import { addListener, getDb } from "./database";
import { SnapShot } from "./Snapshot";
import { Reference } from "./Reference";
import { SerializedQuery, QueryOrderType } from "serialized-query";
import { join, leafNode, DelayType, networkDelay } from "../shared/util";
import { runQuery } from "../shared/runQuery";
import { IDictionary } from "common-types";

export type EventHandler =
  | HandleValueEvent
  | HandleNewEvent
  | HandleRemoveEvent;
export type GenericEventHandler = (snap: SnapShot, key?: string) => void;
export type HandleValueEvent = (dataSnapShot: SnapShot) => void;
export type HandleNewEvent = (
  childSnapshot: SnapShot,
  prevChildKey: string
) => void;
export type HandleRemoveEvent = (oldChildSnapshot: SnapShot) => void;
export type HandleMoveEvent = (
  childSnapshot: SnapShot,
  prevChildKey: string
) => void;
export type HandleChangeEvent = (
  childSnapshot: SnapShot,
  prevChildKey: string
) => void;

export type QueryValue = number | string | boolean | null;

export interface IListener {
  /** random string */
  id: string;
  /** the _query_ the listener is based off of */
  query: SerializedQuery;

  eventType: EventType;
  callback: (a: DataSnapshot | null, b?: string) => any;
  cancelCallbackOrContext?: object | null;
  context?: object | null;
}

export type IQueryFilter<T> = (resultset: T[]) => T[];

/** tslint:ignore:member-ordering */
export class Query<T = any> implements IQuery {
  /**
   * A static initializer which returns a **Firemock** `Query`
   * that has been configured with a `SerializedQuery`.
   *
   * @param query the _SerializedQuery_ to configure with
   */
  public static create(query: SerializedQuery) {
    query.setPath(join(query.path)); // ensures dot notation
    const obj = new Query(query.path);
    obj._query = query;
    return obj;
  }

  protected _query: SerializedQuery;

  constructor(public path: string, protected _delay: DelayType = 5) {
    this._query = SerializedQuery.path(path);
  }

  public get ref(): Reference<T> {
    return new Reference<T>(this.path, this._delay);
  }

  public limitToLast(num: number): Query<T> {
    this._query.limitToLast(num);

    return this as Query<T>;
  }

  public limitToFirst(num: number): Query<T> {
    this._query.limitToFirst(num);

    return this;
  }

  public equalTo(value: QueryValue, key?: Extract<keyof T, string>): Query<T> {
    if (key && this._query.identity.orderBy === QueryOrderType.orderByKey) {
      throw new Error(
        `You can not use "equalTo(val, key)" with a "key" property defined when using a key sort!`
      );
    }
    this._query.equalTo(value, key);

    return this as Query<T>;
  }
  /** Creates a Query with the specified starting point. */
  public startAt(value: QueryValue, key?: string): Query<T> {
    this._query.startAt(value, key);

    return this as Query<T>;
  }

  public endAt(value: QueryValue, key?: string): Query<T> {
    this._query.endAt(value, key);

    return this;
  }

  /**
   * Setup an event listener for a given eventType
   */
  public on(
    eventType: EventType,
    callback: (a: DataSnapshot, b?: null | string) => any,
    cancelCallbackOrContext?: (err?: Error) => void | null,
    context?: object | null
  ): (a: DataSnapshot, b?: null | string) => Promise<null> {
    addListener(
      this._query,
      eventType,
      callback,
      cancelCallbackOrContext,
      context
    );

    return null;
  }

  public once(eventType: "value"): Promise<DataSnapshot> {
    return networkDelay<DataSnapshot>(this.getQuerySnapShot());
  }

  public off() {
    console.log("off() not implemented yet");
  }

  /**
   * Returns a boolean flag based on whether the two queries --
   * _this_ query and the one passed in -- are equivalen in scope.
   */
  public isEqual(other: Query) {
    return this._query.hashCode() === other._query.hashCode();
  }

  /**
   * When the children of a query are all objects, then you can sort them by a
   * specific property. Note: if this happens a lot then it's best to explicitly
   * index on this property in the database's config.
   */
  public orderByChild(prop: string): Query<T> {
    this._query.orderByChild(prop);

    return this;
  }

  /**
   * When the children of a query are all scalar values (string, number, boolean), you
   * can order the results by their (ascending) values
   */
  public orderByValue(): Query<T> {
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
  public orderByKey(): Query<T> {
    this._query.orderByKey();

    return this;
  }

  /** NOT IMPLEMENTED */
  public orderByPriority(): Query<T> {
    return this;
  }

  public toJSON() {
    return {
      identity: this.toString(),
      query: this._query.identity as IDictionary
    };
  }

  public toString() {
    return `FireMock::Query@${process.env.FIREBASE_DATA_ROOT_URL}/${this.path}`;
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
  protected getParent(): IReference | null {
    return null;
  }
  /**
   * This is an undocumented API endpoint that is within the
   * typing provided by Google
   */
  protected getRoot(): IReference {
    return null;
  }

  /**
   * Reduce the dataset using _filters_ (after sorts) but do not apply sort
   * order to new SnapShot (so natural order is preserved)
   */
  private getQuerySnapShot(): SnapShot<T> {
    const data = getDb(this._query.path);
    const results = runQuery(this._query, data);

    return new SnapShot(leafNode(this._query.path), results);
  }
}
