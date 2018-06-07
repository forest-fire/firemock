import { IDictionary, SortingFunction } from "common-types";
import { get } from "lodash-es";
import Reference from "./reference";
// tslint:disable-next-line:no-implicit-dependencies
import { rtdb } from "firebase-api-surface";
import * as convert from "typed-conversions";
import { getParent, getKey, join } from "./util";

/**
 * Each record in the forEach iteration will be passed
 * a snapshot synchronously; if you wish to exit early
 * return a TRUE value
 */
export type Action = (record: SnapShot) => boolean | void;

export default class SnapShot<T = any> implements rtdb.IDataSnapshot {
  private _sortingFunction: SortingFunction;
  constructor(private _key: string, private _value: T[] | T) {}

  public get key() {
    return getKey(join(this._key));
  }

  public get ref() {
    return new Reference<T>(this._key) as rtdb.IReference;
  }

  public val() {
    return Array.isArray(this._value) ? convert.arrayToHash(this._value) : this._value;
  }

  public toJSON() {
    return JSON.stringify(this._value);
  }

  public child<TC = IDictionary>(path: string): rtdb.IDataSnapshot {
    const value = get(this._value, path, null);
    return value ? new SnapShot<TC>(path, value) : null;
  }

  public hasChild(path: string): boolean {
    if (typeof this._value === "object") {
      return Object.keys(this._value).indexOf(path) !== -1;
    }

    return false;
  }

  public hasChildren(): boolean {
    if (typeof this._value === "object") {
      return Object.keys(this._value).length > 0;
    }

    return false;
  }

  public numChildren(): number {
    if (typeof this._value === "object") {
      return Object.keys(this._value).length;
    }

    return 0;
  }

  public exists(): boolean {
    return this._value !== null;
  }

  public forEach(actionCb: Action) {
    const cloned: any = (this._value as any).slice(0);
    const sorted = cloned.sort(this._sortingFunction);
    sorted.map((item: any) => {
      const noId = { ...{}, ...(item as any) };
      delete noId.id;
      const halt = actionCb(new SnapShot(item.id, noId));
      if (halt) {
        return true;
      }
    });

    return false;
  }

  /** NOTE: mocking proxies this call through to val(), no use of "priority" */
  public exportVal() {
    return this.val();
  }

  public getPriority(): string | number | null {
    return null;
  }

  /**
   * Used by Query objects to instruct the snapshot the sorting function to use
   */
  public sortingFunction(fn: SortingFunction) {
    this._sortingFunction = fn;

    return this;
  }
}
