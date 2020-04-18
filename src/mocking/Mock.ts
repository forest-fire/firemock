import { IDictionary } from "common-types";
import { Queue, Schema, Deployment, MockHelper } from "../mocking/index";
import {
  Reference,
  clearDatabase,
  updateDatabase,
  restoreEvents,
  silenceEvents,
  getDb
} from "../rtdb/index";
import { DelayType, setNetworkDelay } from "../shared";
import { auth as fireAuth } from "../auth";
import { clearAuthUsers, initializeAuth } from "../auth/state-mgmt";
import { FireMockError } from "../errors/FireMockError";
import {
  IRelationship,
  ISchema,
  IQueue,
  SchemaCallback,
  IMockConfigOptions,
  IMockAuthConfig,
  AsyncMockData,
  IMockSetup
} from "../@types";
import authProviders from "../auth/client-sdk/AuthProviders";
import { FirebaseNamespace } from "@firebase/app-types";
import { FakerStatic } from "../@types/mocking-types";
export let faker: FakerStatic;

/* tslint:disable:max-classes-per-file */
export class Mock {
  /**
   * returns a Mock object while also ensuring that the
   * Faker library has been asynchronously imported.
   */
  public static async prepare(
    options: IMockConfigOptions = {}
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
  ) {
    const defaultDbConfig = {};
    const obj = new Mock(
      options.db
        ? typeof options.db === "function"
          ? {}
          : options.db || defaultDbConfig
        : defaultDbConfig,
      options.auth
    );
    if (typeof options.db === "function") {
      obj.updateDB(await (options.db as AsyncMockData)(obj));
    }
    try {
      await obj.importFakerLibrary();
    } catch (e) {
      console.info(
        `the Faker library was unable to be imported; if this is a browser environment (or other runtime) this is probably what you want as Faker is pretty large; however, if you do want or need to Fake things in the runtime then the error was: ${e.message}`
      );
    }
    return obj;
  }

  public get db() {
    return getDb();
  }

  public get deploy() {
    return new Deployment();
  }

  private _schemas = new Queue<ISchema>("schemas").clear();
  private _relationships = new Queue<IRelationship>("relationships").clear();
  private _queues = new Queue<IQueue>("queues").clear();
  private _mockInitializer: IMockSetup;
  private _fakerLoaded: Promise<any>;

  constructor(
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    dataOrMock?: IDictionary | IMockSetup,
    authConfig: IMockAuthConfig = {
      providers: ["anonymous"],
      users: []
    }
  ) {
    Queue.clearAll();
    clearDatabase();
    clearAuthUsers();
    if (dataOrMock && typeof dataOrMock === "object") {
      this.updateDB(dataOrMock);
    }
    if (dataOrMock && typeof dataOrMock === "function") {
      this._mockInitializer = dataOrMock(this) as IMockSetup;
    }

    initializeAuth(authConfig);
  }

  /**
   * Update -- _non-desctructively_ -- the mock DB with a JS object/hash
   */
  public updateDB(
    /** the _new_ state that will be updated with the old */
    stateUpdate: IDictionary,
    /** optionally clear the DB before applying the update */
    clearFirst?: boolean
  ) {
    if (clearFirst) {
      clearDatabase();
    }
    updateDatabase(stateUpdate);
  }

  /**
   * silences the database from sending events;
   * this is not typically done but can be done
   * as part of the Mocking process to reduce noise
   */
  public silenceEvents() {
    silenceEvents();
  }

  /**
   * returns the database to its default state of sending
   * events out.
   */
  public restoreEvents() {
    restoreEvents();
  }

  public async auth() {
    return fireAuth();
  }

  public get authProviders(): FirebaseNamespace["auth"] {
    return authProviders;
  }

  public get faker() {
    return faker;
  }

  /**
   * **importFakerLibrary**
   *
   * The **faker** library is a key part of effective mocking but
   * it is a large library so we only want to import it when
   * it's required. Calling this _async_ method will ensure that
   * before you're mocking with faker available.
   */
  public async importFakerLibrary() {
    if (!faker) {
      faker = await import(/* webpackChunkName: "faker-lib" */ "faker");
    }
    return faker;
  }

  /**
   * **getMockHelper**
   *
   * returns a MockHelper class which should always contain
   * access to the faker library off the `faker` property exposed;
   * you can also set some additional `context` where desirable.
   */
  public getMockHelper(context?: IDictionary) {
    if (!faker && !faker.address) {
      throw new FireMockError(
        `The Faker library must be loaded before a MockHelper can be returned`,
        "firemock/faker-not-ready"
      );
    }
    return new MockHelper(context);
  }

  public addSchema<S = any>(schema: string, mock?: SchemaCallback<S>) {
    return new Schema<S>(schema, mock);
  }

  /** Set the network delay for queries with "once" */
  public setDelay(d: DelayType) {
    setNetworkDelay(d);
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
    if (!faker && !faker.address) {
      throw new FireMockError(
        `The Faker library must be loaded before you can generate mocked data can be returned`,
        "firemock/faker-not-ready"
      );
    }

    return new Deployment().generate();
  }

  public ref<T = any>(dbPath: string) {
    return new Reference<T>(dbPath);
  }
}
