import './base-defs';
import * as faker from 'faker';
import { set, get, first } from 'lodash';
import * as fbKey from 'firebase-key';
import Chance = require('chance');
import SnapShot from './snapshot';
import Reference from './reference';
import { getRandomInt, normalizeRef, leafNode } from './util';

export class SchemaHelper {
  private _db: any;
  constructor(raw: any) {
    this._db = raw;
  }
  public get faker() {
    return faker;
  }
  public get chance() {
    return Chance.Chance();
  }
}

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

export interface IQueue {
  id: string;
  schema: string;
  quantity: number;
  hasMany?: IDictionary<number>;
  /** the key refers to the property name, the value true means "fulfill" */
  belongsTo?: IDictionary<boolean>;
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
  private _queue: IQueue[] = [];
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

  public generate() {
    this._queue.map(q => {
      for (let i = q.quantity; i > 0; i--) {
        this.insertMockIntoDB(q.schema);
      }
    });

    this._queue.map(q => {
      for (let i = q.quantity; i > 0; i--) {
        this.insertRelationshipLinks(q);
      }    
    });
  }

  /** Set the network delay for queries with "once" */
  public setDelay(d: DelayType) {
    this._delay = d;
  }
  
  public queueSchema(name: string, quantity: number = 1) {
    const schemas = Object.keys(this._schemas);
    let queueId: string; 

    if (schemas.indexOf(name) === -1) {
      console.log(`Schema "${name}" does not exist; will SKIP.`);
      queueId = '';
    } else {
      const newQueueItem = { id: fbKey.key(), schema: name, quantity };
      this._queue = [newQueueItem].concat(this._queue);
      queueId = newQueueItem.id;
    }

    return this.deploymentAPI(name, queueId);
  }

  /** Add data to the database from the configured schemas */
  public get build() {
    const queueSchema = this.queueSchema.bind(this);
    // to start, we MUST define a schema to queue
    // afterward, more options will open up
    return {
      /** Queue a schema for insertion to the database */
      queueSchema
    };
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

  private insertMockIntoDB(schema: string) {
    const mock = this._schemas[schema].fn();
    const path = this._schemas[schema].path();
    const key = fbKey.key();
    const pathAndKey = path + '.' + key;
    set(this._db, pathAndKey, mock);

    return key;
  }

  private insertRelationshipLinks(queue: IQueue) {
    const relationships = this._relationships.filter(r => r.source === queue.schema);
    const belongsTo = relationships.filter(r => r.type === 'belongsTo');
    const hasMany = relationships.filter(r => r.type === 'hasMany');
    belongsTo.forEach(r => {
      const fulfill = Object.keys(queue.belongsTo || {})
        .filter(v => queue.belongsTo[v] === true)
        .indexOf( r.sourceProperty ) !== -1;
      const source = this._schemas[r.source];
      const target = this._schemas[r.target];
      let getID: () => string;
      
      if (fulfill) {
        const mockAvailable = this._schemas[r.target] ? true : false;
        const available = Object.keys(this.db[this.pluralize(r.target)] || {});
        const generatedAvailable = available.length > 0;
        
        const numChoices = (this._db[r.target] || []).length;
        const choice = () => generatedAvailable 
          ? available[getRandomInt(0, available.length - 1)]
          : this.insertMockIntoDB(r.target);
        
        getID = () => mockAvailable 
          ? generatedAvailable 
            ? choice()
            : this.insertMockIntoDB(r.target)
          : fbKey.key();
      } else {
        getID = () => '';
      }

      const property = r.sourceProperty;
      const path = source.path();
      const recordList: IDictionary = get(this._db, source.path(), {});

      Object.keys(recordList).forEach(key => {
        set(this._db, `${source.path()}.${key}.${property}`, getID());
      });
    });

    hasMany.forEach(r => {
      const fulfill = Object.keys(queue.hasMany || {})
        .indexOf( r.sourceProperty ) !== -1;
      const howMany = fulfill 
        ? queue.hasMany[r.sourceProperty] 
        : 0;
      const source = this._schemas[r.source];
      const target = this._schemas[r.target];
      let getID: () => string;
      
      if (fulfill) {
        const mockAvailable = this._schemas[r.target] ? true : false;
        const available = Object.keys(this.db[this.pluralize(r.target)] || {});
        const used: string[] = [];
        const generatedAvailable = available.length > 0;
        const numChoices = (this._db[this.pluralize(r.target)] || []).length;

        const choice = (pool: string[]) => {
          if (pool.length > 0) {
            const chosen = pool[getRandomInt(0, pool.length - 1)];
            used.push(chosen);
            return chosen;
          }
          
          return this.insertMockIntoDB(r.target);
        };
        
        getID = () => mockAvailable
          ? choice(available.filter(a => used.indexOf(a) === -1))
          : fbKey.key();
      } else {
        getID = () => undefined;
      }

      const property = r.sourceProperty;
      const path = source.path();
      const sourceRecords: IDictionary = get(this._db, source.path(), {});

      Object.keys(sourceRecords).forEach(key => {
        for ( let i = 1; i <= howMany; i++ ) {
          set(this._db, `${source.path()}.${key}.${property}.${getID()}`, true);
        }
      });
    });
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

  private fulfillBelongsTo = (sourceSchema: string, queueId?: string) => (
    targetSchema: string
  ) => {
    const schema = this._schemas[sourceSchema];
    const relationship = first(this._relationships
      .filter(r => r.source === sourceSchema)
      .filter(r => r.target === targetSchema)
    );
    
    const sourceProperty = schema.path();
    this._queue = this._queue.map(q => q.id === queueId
      ? { 
          ...q, 
          ...{ 
            belongsTo: {
              ...q.belongsTo,
              ...{ [relationship.sourceProperty]: true } 
            }
          }
        }
      : q
    );
    
    return this.deploymentAPI(sourceSchema);
  }

  private quantifyHasMany = (sourceSchema: string, queueId?: string) => (
    targetSchema: string,
    quantity: number
  ) => {
    const hasMany = this._relationships.filter(
      r => r.type === 'hasMany' && r.source === sourceSchema
    );
    const targetted = hasMany.filter(r => r.target === targetSchema);

    if (hasMany.length === 0) {
      console.log(
        `Attempt to quantify "hasMany" relationships with schema "${sourceSchema}" is not possible; no such relationships exist`
      );
    } else if (targetted.length === 0) {
      console.log(
        `The "${targetSchema}" schema does not have a "hasMany" relationship with the "${sourceSchema}" model`
      );
    } else {
      this._queue = this._queue.map(q => {
        return q.id === queueId
          ? { 
              ...q, 
              ...{ hasMany: { 
                ...q.hasMany,
                ...{[this.pluralize(targetSchema)]: quantity } 
              }}
            }
          : q;
      });
    }

    return this.deploymentAPI(sourceSchema);
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
      build: this.build
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

  private deploymentAPI(schema: string, queueKey?: string) {
    return {
      /** Queue a schema for generation */
      queueSchema: this.queueSchema.bind(this),
      /** 
       * Provides specificity around how many of a given 
       * "hasMany" relationship should be fulfilled of 
       * the schema currently being queued.
       */
      quantifyHasMany: this.quantifyHasMany(schema, queueKey),
      fulfillBelongsTo: this.fulfillBelongsTo(schema, queueKey),
      generate: this.generate.bind(this)
    };
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
