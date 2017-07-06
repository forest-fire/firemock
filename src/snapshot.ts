import './base-defs';
import { get } from 'lodash';
import * as firebase from 'firebase-admin';

/**
 * Each record in the forEach iteration will be passed
 * a snapshot synchronously; if you wish to exit early
 * return a TRUE value
 */
export type Action = (action: SnapShot) => boolean;

export default class SnapShot<T = IDictionary> {
  constructor(
    public key: string,
    private _value: T
  ) {}

  public val() {
    return this._value;
  }

  public toJSON() {
    return JSON.stringify(this._value);
  }

  public child<TC = IDictionary>(path: string) {
    const value = get(this._value, path, null);
    return value ? new SnapShot<TC>(path, value) : null;
  }

  public hasChild(path: string): boolean {
    if (typeof this._value === 'object') {
      return Object.keys(this._value).indexOf(path) !== -1;
    }

    return false;
  }

  public hasChildren(path: string): boolean {
    if (typeof this._value === 'object') {
      return Object.keys(this._value).length > 0;
    }

    return false;
  }

  public numChildren(path: string): number {
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
}
