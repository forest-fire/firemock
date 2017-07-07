import { IDictionary } from 'common-types';
import SnapShot from './snapshot';
import { get } from 'lodash';
import { parts, normalizeRef, leafNode, getRandomInt, removeKeys } from './util';

/** named network delays */
export enum Delays {
  random = 'random',
  weak = 'weak-mobile',
  mobile = 'mobile',
  WiFi = 'WIFI'
}

export type AsyncOrSync<T> = Promise<SnapShot<T>> | SnapShot<T>;
export type DelayType = number | number[] | IDictionary<number> | Delays;
export type Query = (snap: SnapShot) => SnapShot;
export type QueryStack = Query[];

export default class Reference<T = IDictionary>{
  private _query: QueryStack = [];

  constructor(
    public ref: string,
    private _state: T,
    private _delay: DelayType = 5
  ) {}

  public get parent() {
    const r = parts(this.ref).slice(-1).join('.');
    return new Reference(r, get(this._state, r));
  }

  public child(path: string) {
    const r = parts(this.ref).concat([path]).join('.');
    return new Reference(r, get(this._state, r));
  }

  public once(eventType: 'value'): Promise<SnapShot<T>> {
    const snapshot = this._once();
    return new Promise( resolve => {
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

  public equalTo(value: any, key: string) {
    this._query.push((snap: SnapShot<T>) => {
      let js: any = snap.val() as T;
      const remove = Object.keys(js).filter(k => js[k][key] !== value);
      js = removeKeys(js, remove);
      return new SnapShot(snap.key, js);
    });

    return this;
  }

  private _once(): SnapShot<T> {
    const response = get(this._state, normalizeRef(this.ref), undefined);
    let snapshot: any = new SnapShot<T>(leafNode(this.ref), response);
    this._query.forEach(q => snapshot = q(snapshot))

    return snapshot as SnapShot<T>;
  }

  private delay() {
    const delay = this._delay as IDictionary | number | number[] | Delays;
    if (typeof delay === 'number') {
      return delay;
    }

    if (Array.isArray(delay)) {
      const [ min, max ] = delay;
      return getRandomInt(min, max);
    }

    if (typeof delay === 'object' && !Array.isArray(delay)) {
      const { min, max } = delay;
      return getRandomInt(min, max);
    }

    // these numbers need some reviewing
    if (delay === 'random') { return getRandomInt(10, 300); }
    if (delay === 'weak') { return getRandomInt(400, 900); }
    if (delay === 'mobile') { return getRandomInt(300, 500); }
    if (delay === 'WIFI') { return getRandomInt(10, 100); }
    
    throw new Error('Delay property is of unknown format: ' + delay);
  }

}