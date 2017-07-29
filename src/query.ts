import { IDictionary } from 'common-types';
import * as firebase from 'firebase-admin';
import SnapShot from './snapshot';
import Reference, { DelayType } from './reference';

export default class Query<T = any> implements firebase.database.Query {
  constructor(public path: string, protected _delay: DelayType = 5) {}

  public get key(): string | null {
    return null;
  }

  public ref(path?: string) {
    return new Reference<T>(path || this.path, this._delay);
  }

  
}
