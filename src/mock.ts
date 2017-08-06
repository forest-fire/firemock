import { IDictionary } from 'common-types';
import { set, get, first } from 'lodash';
import * as fbKey from 'firebase-key';
import SnapShot from './snapshot';
import Reference from './reference';
import Deployment from './deployment';
import SchemaHelper from './schema-helper';
import Schema from './schema';
import Queue from './queue';
import { db, clearDatabase, updateDatabase } from './database';
import { getRandomInt, normalizeRef, leafNode } from './util';

export interface ISchema {
  id: string;
  /** path to the database which is the root for given schema list */
  path: () => string;
  /** mock generator function */
  fn: () => IDictionary;
  /** 
   * the name of the entity being mocked, if not set then schema name 
   * is assume to equal model name  
   */
  modelName?: string;
}
import { Delays, DelayType } from './query';
export { Delays, DelayType } from './query';

export interface IRelationship {
  id: string,
  /** cardinality type */
  type: 'hasMany' | 'belongsTo';
  /** the source model */
  source: string;
  /** 
   * the property on the source model which is the FK 
   * (by default it will use standard naming conventions)
   */
  sourceProperty: string;
  /** the model being referred to in the source model's FK */
  target: string;
}

export type MockGeneratorCallback = (helper: SchemaHelper) => any;

/* tslint:disable:max-classes-per-file */
export default class Mock {
  private _schemas = new Queue<ISchema>('schemas').clear();
  private _relationships = new Queue<IRelationship>('relationships').clear();
  private _queues = new Queue('queues').clear();
  private _delay?: DelayType = 5;

  constructor(raw?: IDictionary) {
    Queue.clearAll();
    clearDatabase();
    if (raw) {
      this.updateDB(raw);
    } 
  }

  /**
   * Update the mock DB with a raw JS object/hash
   */
  public updateDB(state: IDictionary) {
    updateDatabase(state);
  }

  public get db() {
    return db;
  }
  
  public addSchema<S = any>(schema: string, mock?: MockGeneratorCallback) {
    const s = new Schema<S>(schema);
    if (mock) {
      s.mock(mock);
    }
    return new Schema<S>(schema);
  }

  /** Set the network delay for queries with "once" */
  public setDelay(d: DelayType) {
    this._delay = d;
  }

  public get deploy() {
    return new Deployment();
  }

  public queueSchema<T = any>(schemaId: string, quantity: number = 1, overrides: IDictionary<Partial<T>> = {}) {
    const d = new Deployment();
    d.queueSchema(schemaId, quantity, overrides);
    return d;
  };

  public generate() {
    return new Deployment().generate();
  }

  public ref = <T = IDictionary>(dbPath: string) => {
    return new Reference<T>(dbPath, this._delay);
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

  private once = (reference: string) => <T = IDictionary>(eventType?: 'value') => {
    const response = get(this.db, normalizeRef(reference), undefined);
    const snapshot = new SnapShot<T>(leafNode(reference), response);

    if (this._delay) {
      return new Promise( resolve => {
        setTimeout(() => resolve(snapshot), this.delay());
      });
    }

    return snapshot;
  }
}
