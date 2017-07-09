import { set, get, first } from 'lodash';
import * as fbKey from 'firebase-key';
import SnapShot from './snapshot';
import Reference from './reference';
import Deployment from './deployment';
import SchemaHelper from './schema-helper';
import { getRandomInt, normalizeRef, leafNode } from './util';

export interface ISchema {
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

export interface IRelationship {
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

/**
 * The property that exists on the source scheme as a FK reference
 * to the external schema/entity. 
 */
export type SourceProperty = string;

export enum Delays {
  random = 'random',
  weak = 'weak-mobile',
  mobile = 'mobile',
  WiFi = 'WIFI'
}

export type DelayType = number | number[] | IDictionary<number> | Delays;

/* tslint:disable:max-classes-per-file */
export default class Mock {
  private _db: IDictionary = {};
  private _schemas: IDictionary<ISchema> = {};
  private _relationships: IRelationship[] = [];
  private _delay?: DelayType = 5;
  /** allows non-standard pluralizations to be stated explicitly */
  private _exceptions: IDictionary<string> = {
    child: 'children',
    man: 'men',
    woman: 'women',
    tooth: 'teeth',
    foot: 'feet',
    mouse: 'mice',
    person: 'people',
    company: 'companies'
  };

  constructor(raw?: IDictionary) {
    if (raw) {
      this.raw(raw);
    }
  }

  public raw(state: IDictionary) {
    Object.keys(state).forEach(k => this._db[k] = state[k]);
  }

  public get db() {
    return this._db;
  }

  /** 
   * Specify a schema/entity which will be mocked
   */
  public addSchema(name: string) {
    return this.schemaAPI(name);
  }

  /** establish relationships between models */
  public relate = (source: string) => {
    return {
      hasMany: this.hasMany(source),
      belongsTo: this.belongsTo(source)
    };
  }

  /** Set the network delay for queries with "once" */
  public setDelay(d: DelayType) {
    this._delay = d;
  }

  public get deploy() {
    return new Deployment(this._schemas, this._relationships, this._queue, this._db);
  }

  public ref = <T = IDictionary>(dbPath: string) => {
    return new Reference<T>(dbPath, this._db as T, this._delay);
  }

  public addPluralizeException = (singular: string) => (plural: string) => {
    this._exceptions[singular] = plural;
    return this.schemaAPI(singular);
  }

  private singularExceptions = () => {
    const pluralize = this._exceptions;
    return Object.keys(pluralize).reduce(
      (agg: IDictionary, k: string) => agg[pluralize[k]] = k,
      new Object()
    );
  };

  /**
   * Add a mocking function to be used to generate the schema in mock DB
   */
  private mock = (schema: string) => (cb: MockGeneratorCallback) => {
    this._schemas[schema] = {
      fn: cb(new SchemaHelper(this._db)),
      path: () =>
        this._schemas[schema].modelName
          ? this.pluralize(this._schemas[schema].modelName)
          : this.pluralize(schema)
    };

    return this.schemaAPI(schema);
  }

  private pluralize(thingy: string) {
    const rules = [
      { find: /(.*)(ch|sh|ax|ss)$/, replace: '$1$2es' },
      { find: /(.*)(fe|f)$/, replace: '$1ves' },
      { find: /(.*)us$/, replace: '$1i' }
    ];
    for (const r of rules) {
      if (r.find.test(thingy)) {
        return thingy.replace(r.find, r.replace);
      }
    }

    return this._exceptions[thingy] ? this._exceptions[thingy] : `${thingy}s`;
  }

  private modelName = (schema: string) => (model: string) => {
    this._schemas[schema].modelName = model;

    return this.schemaAPI(schema);
  }

  private schemaAPI(schema: string) {
    const schemaHelper = new SchemaHelper(schema);
    return {
      mock: this.mock(schema),
      /**
       * There are times where it's appropriate to have multiple schemas for 
       * the same entity/model, in this case you'll want to state what model
       * your schema is emulating. If you don't state this property it assumes 
       * the schema name IS the model name
       */
      modelName: this.modelName(schema),
      /**
       * The default pluralizer is quite simple so if you find that
       * it is pluralizing incorrectly then you can manually state 
       * the plural name.
       */
      pluralName: this.addPluralizeException(schema),
      /**
       * Configures a "belongsTo" relationship with another schema/entity
       */
      belongsTo: this.belongsTo(schema),
      /**
       * Configures a "hasMany" relationship with another schema/entity
       */
      hasMany: this.hasMany(schema),

      /**
       * Add another schema
       */
      addSchema: this.addSchema.bind(this),
      /**
       * Finish the schema configuration and move onto generation of schemas
       */
      build: this.deploy
    };
  }

  private hasMany = (source: string) => (
    target: string,
    sourceProperty?: SourceProperty
  ) => {
    this._relationships.push({
      type: 'hasMany',
      source,
      target,
      sourceProperty: sourceProperty ? sourceProperty : this.pluralize(target)
    });

    return this.schemaAPI(source);
  }

  private belongsTo = (source: string, queueKey?: string) => (
    target: string,
    sourceProperty?: SourceProperty
  ) => {
    this._relationships.push({
      type: 'belongsTo',
      source,
      target,
      sourceProperty: sourceProperty ? sourceProperty : `${target}Id`
    });

    return this.schemaAPI(source);
  }

  private queryAPI(reference: string) {
    return {
      once: this.once(reference)
    };
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
