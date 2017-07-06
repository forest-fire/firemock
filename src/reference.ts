import { IDictionary } from 'common-types';
import SnapShot from './snapshot';
import { get } from 'lodash';
import { parts, normalizeRef, leafNode, getRandomInt } from './util';

/** named network delays */
export enum Delays {
  random = 'random',
  weak = 'weak-mobile',
  mobile = 'mobile',
  WiFi = 'WIFI'
}

export type AsyncOrSync<T> = Promise<SnapShot<T>> | SnapShot<T>;
export type DelayType = number | number[] | IDictionary<number> | Delays;

export default class Reference<T = IDictionary>{

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

  public once(eventType?: 'value'): AsyncOrSync<T> {
    const response = get(this._state, normalizeRef(this.ref), undefined);
    const snapshot = new SnapShot<T>(leafNode(this.ref), response);

    if (this._delay) {
      return new Promise( resolve => {
        setTimeout(() => resolve(snapshot), this.delay());
      });
    }

    return snapshot;
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