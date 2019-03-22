import { IDictionary } from "common-types";
import { Queue, Schema, SchemaHelper, Reference, Deployment } from "./index";
import { db, clearDatabase, updateDatabase } from "./database";
import { DelayType, setNetworkDelay } from "./util";
import { MockHelper } from "./MockHelper";
import { auth as fireAuth } from "./auth";
import { IMockAuthConfig, IMockSetup } from "./auth/types";
import { authAdminApi } from "./auth/authAdmin";

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
  id: string;
  /** cardinality type */
  type: "hasMany" | "belongsTo";
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

/** Queued up schema's ready for generation */
export interface IQueue {
  id: string;
  schema: string;
  quantity: number;
  hasMany?: IDictionary<number>;
  overrides?: IDictionary;
  prefix: string;
  /** the key refers to the property name, the value true means "fulfill" */
  belongsTo?: IDictionary<boolean>;
}

/** A Schema's mock callback generator must conform to this type signature */
export type SchemaCallback<T = any> = (helper: SchemaHelper) => () => T;

/* tslint:disable:max-classes-per-file */
export default class Mock {
  private _schemas = new Queue<ISchema>("schemas").clear();
  private _relationships = new Queue<IRelationship>("relationships").clear();
  private _queues = new Queue<IQueue>("queues").clear();
  private _mockInitializer: IMockSetup;

  constructor(
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    dataOrMock?: IDictionary | IMockSetup,
    authConfig: IMockAuthConfig = {
      allowAnonymous: true,
      allowEmailLogins: false,
      allowEmailLinks: false,
      allowPhoneLogins: false
    }
  ) {
    Queue.clearAll();
    clearDatabase();
    if (dataOrMock && typeof dataOrMock === "object") {
      this.updateDB(dataOrMock);
    }
    if (dataOrMock && typeof dataOrMock === "function") {
      this._mockInitializer = dataOrMock(this) as IMockSetup;
    }

    authAdminApi.configureAuth(authConfig);
  }

  /**
   * Update the mock DB with a raw JS object/hash
   */
  public updateDB(state: IDictionary) {
    updateDatabase(state);
  }

  public async auth() {
    return fireAuth();
  }

  public getMockHelper() {
    return new MockHelper();
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

  public queueSchema<T = any>(
    schemaId: string,
    quantity: number = 1,
    overrides: IDictionary = {}
  ) {
    const d = new Deployment();
    d.queueSchema(schemaId, quantity, overrides);
    return d;
  }

  public generate() {
    return new Deployment().generate();
  }

  public ref<T = any>(dbPath: string) {
    return new Reference<T>(dbPath);
  }
}
