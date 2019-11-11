import { IDictionary } from "common-types";
import { Queue, Schema, Reference, Deployment, IMockSetup } from "./index";
import {
  db,
  clearDatabase,
  updateDatabase,
  silenceEvents,
  restoreEvents
} from "./database";
import { DelayType, setNetworkDelay } from "./util";
import { MockHelper } from "./MockHelper";
import { auth as fireAuth } from "./auth";
import { authAdminApi, clearAuthUsers } from "./auth/authAdmin";
import { FireMockError } from "./errors/FireMockError";
import {
  IRelationship,
  ISchema,
  IQueue,
  SchemaCallback
} from "./@types/db-types";
import { IMockConfigOptions, IMockAuthConfig } from "./@types/config-types";
export let faker: Faker.FakerStatic;

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
    const defaultAuthConfig: IMockAuthConfig = {
      allowAnonymous: true,
      allowEmailLogins: false,
      allowEmailLinks: false,
      allowPhoneLogins: false,
      validEmailUsers: []
    };
    const defaultDbConfig = {};
    const obj = new Mock(
      options.db
        ? typeof options.db === "function"
          ? await options.db()
          : options.db || defaultDbConfig
        : defaultDbConfig,
      options.auth
        ? { ...defaultAuthConfig, ...options.auth }
        : defaultAuthConfig
    );
    try {
      await obj.importFakerLibrary();
    } catch (e) {
      console.info(
        `the Faker library was unable to be imported; this may or may not impact you based on your goals for this environment. The error was: ${e.message}`
      );
    }
    return obj;
  }

  public get db() {
    return db;
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
      allowAnonymous: true,
      allowEmailLogins: false,
      allowEmailLinks: false,
      allowPhoneLogins: false
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

    authAdminApi.configureAuth(authConfig);
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
