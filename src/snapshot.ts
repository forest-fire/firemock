import { IDictionary } from 'common-types';
import { get } from 'lodash';
import Reference from './reference';
import * as firebase from 'firebase-admin';

/**
 * Each record in the forEach iteration will be passed
 * a snapshot synchronously; if you wish to exit early
 * return a TRUE value
 */
export type Action = (action: firebase.database.DataSnapshot) => boolean | void;

export default class SnapShot<T = IDictionary>
  implements firebase.database.DataSnapshot {
  private _ref: Reference<T>;
  constructor(public key: string, private _value: T) {}

  public get ref() {
    if (!this._ref) {
      this._ref = new Reference<T>(this.key);
    }

    return this._ref as firebase.database.Reference;
  }

  public val() {
    return this._value;
  }

  public toJSON() {
    return JSON.stringify(this._value);
  }

  public child<TC = IDictionary>(path: string): firebase.database.DataSnapshot {
    const value = get(this._value, path, null);
    return value ? new SnapShot<TC>(path, value) : null;
  }

  public hasChild(path: string): boolean {
    if (typeof this._value === 'object') {
      return Object.keys(this._value).indexOf(path) !== -1;
    }

    return false;
  }

  public hasChildren(): boolean {
    if (typeof this._value === 'object') {
      return Object.keys(this._value).length > 0;
    }

    return false;
  }

  public numChildren(): number {
    if (typeof this._value === 'object') {
      return Object.keys(this._value).length;
    }

    return 0;
  }

  public exists(): boolean {
    return this._value !== null;
  }

  public forEach(action: Action) {
    const keys = Object.keys(this._value);
    keys.forEach(key => {
      const halt = action(new SnapShot(key, get(this._value, key)));
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
}
