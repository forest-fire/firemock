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
import { getRandomInt, normalizeRef, leafNode, DelayType, Delays, setNetworkDelay } from './util';

export {default as SchemaHelper} from './schema-helper';

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
  /** a static path that preceeds this schema's placement in the database */
  prefix?: string;
}

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

/** A Schema's mock callback generator must conform to this type signature */
export type SchemaCallback<T = any> = (helper: SchemaHelper) => () => T;

/* tslint:disable:max-classes-per-file */
export default class Mock {
  private _schemas = new Queue<ISchema>('schemas').clear();
  private _relationships = new Queue<IRelationship>('relationships').clear();
  private _queues = new Queue('queues').clear();

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

  public addSchema<S = any>(schema: string, mock?: SchemaCallback) {
    const s = new Schema<S>(schema);
    if (mock) {
      s.mock(mock);
    }
    return new Schema<S>(schema);
  }

  /** Set the network delay for queries with "once" */
  public setDelay(d: DelayType) {
    setNetworkDelay(d);
  }

  public get deploy() {
    return new Deployment();
  }

  public queueSchema<T = any>(schemaId: string, quantity: number = 1, overrides: IDictionary = {}) {
    const d = new Deployment();
    d.queueSchema(schemaId, quantity, overrides);
    return d;
  };

  public generate() {
    return new Deployment().generate();
  }

  public ref = <T = IDictionary>(dbPath: string) => {
    return new Reference<T>(dbPath);
  }

}
