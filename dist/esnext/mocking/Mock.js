import { Queue, Schema, Deployment } from "./index";
import {
  Reference,
  db,
  clearDatabase,
  updateDatabase,
  restoreEvents,
  silenceEvents
} from "../rtdb/index";
import { setNetworkDelay } from "../shared/util";
import { MockHelper } from "./MockHelper";
import { auth as fireAuth } from "../auth";
import { clearAuthUsers, initializeAuth } from "../auth/state-mgmt";
import { FireMockError } from "../errors/FireMockError";
import authProviders from "../auth/client-sdk/AuthProviders";
export let faker;
/* tslint:disable:max-classes-per-file */
export class Mock {
  constructor(
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    dataOrMock,
    authConfig = {
      providers: ["anonymous"],
      users: []
    }
  ) {
    this._schemas = new Queue("schemas").clear();
    this._relationships = new Queue("relationships").clear();
    this._queues = new Queue("queues").clear();
    Queue.clearAll();
    clearDatabase();
    clearAuthUsers();
    if (dataOrMock && typeof dataOrMock === "object") {
      this.updateDB(dataOrMock);
    }
    if (dataOrMock && typeof dataOrMock === "function") {
      this._mockInitializer = dataOrMock(this);
    }
    initializeAuth(authConfig);
  }
  /**
   * returns a Mock object while also ensuring that the
   * Faker library has been asynchronously imported.
   */
  static async prepare(
    options = {}
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
      obj.updateDB(await options.db(obj));
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
  get db() {
    return db;
  }
  get deploy() {
    return new Deployment();
  }
  /**
   * Update -- _non-desctructively_ -- the mock DB with a JS object/hash
   */
  updateDB(
    /** the _new_ state that will be updated with the old */
    stateUpdate,
    /** optionally clear the DB before applying the update */
    clearFirst
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
  silenceEvents() {
    silenceEvents();
  }
  /**
   * returns the database to its default state of sending
   * events out.
   */
  restoreEvents() {
    restoreEvents();
  }
  async auth() {
    return fireAuth();
  }
  get authProviders() {
    return authProviders;
  }
  get faker() {
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
  async importFakerLibrary() {
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
  getMockHelper(context) {
    if (!faker && !faker.address) {
      throw new FireMockError(
        `The Faker library must be loaded before a MockHelper can be returned`,
        "firemock/faker-not-ready"
      );
    }
    return new MockHelper(context);
  }
  addSchema(schema, mock) {
    const s = new Schema(schema);
    if (mock) {
      s.mock(mock);
    }
    return new Schema(schema);
  }
  /** Set the network delay for queries with "once" */
  setDelay(d) {
    setNetworkDelay(d);
  }
  queueSchema(schemaId, quantity = 1, overrides = {}) {
    const d = new Deployment();
    d.queueSchema(schemaId, quantity, overrides);
    return d;
  }
  generate() {
    if (!faker && !faker.address) {
      throw new FireMockError(
        `The Faker library must be loaded before you can generate mocked data can be returned`,
        "firemock/faker-not-ready"
      );
    }
    return new Deployment().generate();
  }
  ref(dbPath) {
    return new Reference(dbPath);
  }
}
//# sourceMappingURL=Mock.js.map
