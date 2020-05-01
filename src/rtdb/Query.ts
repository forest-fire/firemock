import {
  RtdbQuery,
  RtdbReference,
  RtdbDataSnapshot,
  RtdbEventType,
  QueryValue,
  IFirebaseEventHandler,
} from "../@types/rtdb-types";
import { getDb, SnapShot } from "../rtdb/index";
import { SerializedQuery, QueryOrderType } from "serialized-query";
import { leafNode, DelayType, networkDelay } from "../shared/index";
import { runQuery } from "../shared/index";
import { IDictionary } from "common-types";

/** tslint:ignore:member-ordering */
export abstract class Query<T = any> implements RtdbQuery {
  public path: string;
  protected _query: SerializedQuery;
  protected _delay: DelayType;

  constructor(path: string | SerializedQuery, delay: DelayType = 5) {
    this.path = (typeof path === "string"
      ? path
      : SerializedQuery.path) as string;
    this._delay = delay;
    this._query = typeof path === "string" ? SerializedQuery.path(path) : path;
  }

  public get ref(): RtdbReference {
    return (this as unknown) as RtdbReference;
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
    eventType: RtdbEventType,
    callback: (a: RtdbDataSnapshot, b?: null | string) => any,
    cancelCallbackOrContext?: (err?: Error) => void | null,
    context?: object | null
  ): (a: RtdbDataSnapshot, b?: null | string) => Promise<null> {
    this.addListener(
      this._query,
      eventType,
      callback,
      cancelCallbackOrContext,
      context
    );

    return null;
  }

  public async once(eventType: "value"): Promise<RtdbDataSnapshot> {
    await networkDelay();
    return this.getQuerySnapShot();
  }

  public off() {
    console.log("off() not implemented yet on Firemock");
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
      query: this._query.identity as IDictionary,
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
  protected getParent(): RtdbReference | null {
    return null;
  }
  /**
   * This is an undocumented API endpoint that is within the
   * typing provided by Google
   */
  protected getRoot(): RtdbReference {
    return null;
  }

  protected abstract addListener(
    pathOrQuery: string | SerializedQuery<any>,
    eventType: RtdbEventType,
    callback: IFirebaseEventHandler,
    cancelCallbackOrContext?: (err?: Error) => void,
    context?: IDictionary
  ): Promise<RtdbDataSnapshot>;

  /**
   * Reduce the dataset using _filters_ (after sorts) but do not apply sort
   * order to new SnapShot (so natural order is preserved)
   */
  private getQuerySnapShot() {
    const path = this._query.path || this.path;
    const data = getDb(path);
    const results = runQuery(this._query, data);

    return new SnapShot(leafNode(this._query.path), results ? results : null);
  }
}
