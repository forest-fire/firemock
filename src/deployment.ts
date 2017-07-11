import { IDictionary } from 'common-types';
import * as fbKey from 'firebase-key';
import { get, set, first } from 'lodash';
import { IRelationship, ISchema } from './mock';
import { getRandomInt } from './util';
import Queue from './queue';
import pluralize from './pluralize';
import { db } from './database';

export interface IQueue {
  id: string;
  schema: string;
  quantity: number;
  hasMany?: IDictionary<number>;
  overrides?: IDictionary;
  /** the key refers to the property name, the value true means "fulfill" */
  belongsTo?: IDictionary<boolean>;
}
export default class Deployment {
  private schemaId: string;
  private queueId: string;
  private _queue = new Queue<IQueue>('queue');
  private _schemas = new Queue<ISchema>('schemas'); 
  private _relationships = new Queue<IRelationship>('relationships'); 

  /**
   * Queue a schema for deployment to the mock DB
   */
  public queueSchema<T = any>(schemaId: string, quantity: number = 1, overrides: IDictionary<Partial<T>> = {}) {
    this.schemaId = schemaId;
    this.queueId = fbKey.key();
    const schema = this._schemas.find(schemaId);

    if (!schema) {
      console.log(`Schema "${schema}" does not exist; will SKIP.`);
    } else {
      const newQueueItem = { id: this.queueId, schema: schemaId, quantity, overrides };
      this._queue.enqueue(newQueueItem);
    }

    return this;
  }

  /** 
   * Provides specificity around how many of a given 
   * "hasMany" relationship should be fulfilled of 
   * the schema currently being queued.
   */
  public quantifyHasMany(targetSchema: string, quantity: number) {
    const hasMany = this._relationships.filter(
      r => r.type === 'hasMany' && r.source === this.schemaId
    );
    const targetted = hasMany.filter(r => r.target === targetSchema);

    if (hasMany.length === 0) {
      console.log(
        `Attempt to quantify "hasMany" relationships with schema "${this.schemaId}" is not possible; no such relationships exist`
      );
    } else if (targetted.length === 0) {
      console.log(
        `The "${targetSchema}" schema does not have a "hasMany" relationship with the "${this.schemaId}" model`
      );
    } else {
      const queue = this._queue.find(this.queueId);
      this._queue.update(this.queueId, {
       hasMany: { 
          ...queue.hasMany,
          ...{[pluralize(targetSchema)]: quantity } 
        }
      });
    }

    return this;
  }

  /**
   * Indicates the a given "belongsTo" should be fulfilled with a 
   * valid FK reference when this queue is generated.
   */
  public fulfillBelongsTo(targetSchema: string) {
    const schema = this._schemas.find(this.schemaId);
    const relationship = first(this._relationships
      .filter(r => r.source === this.schemaId)
      .filter(r => r.target === targetSchema)
    );
    
    const sourceProperty = schema.path();
    const queue = this._queue.find(this.queueId);
    this._queue.update(this.queueId, {
      belongsTo: { 
        ...queue.belongsTo,
        ...{[`${targetSchema}Id`]: true } 
      }
    });
    
    return this;  
  }

  public generate() {
    this._queue.map(q => {
      for (let i = q.quantity; i > 0; i--) {
        this.insertMockIntoDB(q.schema, q.overrides);
      }
    });

    this._queue.map(q => {
      for (let i = q.quantity; i > 0; i--) {
        this.insertRelationshipLinks(q);
      }    
    });
  }

  private insertMockIntoDB(schema: string, overrides: IDictionary) {
    const mock = this._schemas.find(schema).fn();
    const path = this._schemas.find(schema).path();
    const key = fbKey.key();
    const pathAndKey = path + '.' + key;
    set(db, pathAndKey, { ...mock, ...overrides });

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
      const source = this._schemas.find(r.source);
      const target = this._schemas.find(r.target);
      let getID: () => string;
      
      if (fulfill) {
        const mockAvailable = this._schemas.find(r.target) ? true : false;
        const available = Object.keys(db[pluralize(r.target)] || {});
        const generatedAvailable = available.length > 0;
        
        const numChoices = (db[r.target] || []).length;
        const choice = () => generatedAvailable 
          ? available[getRandomInt(0, available.length - 1)]
          : this.insertMockIntoDB(r.target, {});
        
        getID = () => mockAvailable 
          ? generatedAvailable 
            ? choice()
            : this.insertMockIntoDB(r.target, {})
          : fbKey.key();
      } else {
        getID = () => '';
      }

      const property = r.sourceProperty;
      const path = source.path();
      const recordList: IDictionary = get(db, source.path(), {});

      Object.keys(recordList).forEach(key => {
        set(db, `${source.path()}.${key}.${property}`, getID());
      });
    });

    hasMany.forEach(r => {
      const fulfill = Object.keys(queue.hasMany || {})
        .indexOf( r.sourceProperty ) !== -1;
      const howMany = fulfill 
        ? queue.hasMany[r.sourceProperty] 
        : 0;
      
      const source = this._schemas.find(r.source);
      const target = this._schemas.find(r.target);
      let getID: () => string;
      
      if (fulfill) {
        const mockAvailable = this._schemas.find(r.target) ? true : false;
        const available = Object.keys(db[pluralize(r.target)] || {});
        const used: string[] = [];
        const generatedAvailable = available.length > 0;
        const numChoices = (db[pluralize(r.target)] || []).length;

        const choice = (pool: string[]) => {
          if (pool.length > 0) {
            const chosen = pool[getRandomInt(0, pool.length - 1)];
            used.push(chosen);
            return chosen;
          }
          
          return this.insertMockIntoDB(r.target, {});
        };
        
        getID = () => mockAvailable
          ? choice(available.filter(a => used.indexOf(a) === -1))
          : fbKey.key();
      } else {
        getID = () => undefined;
      }

      const property = r.sourceProperty;
      
      const path = source.path();
      const sourceRecords: IDictionary = get(db, source.path(), {});

      Object.keys(sourceRecords).forEach(key => {
        for ( let i = 1; i <= howMany; i++ ) {
          set(db, `${source.path()}.${key}.${property}.${getID()}`, true);
        }
      });
    });
  }

}