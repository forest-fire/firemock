import { Queue, Schema, Deployment } from "../mocking/index";
import { Reference, clearDatabase, updateDatabase, restoreEvents, silenceEvents, getDb, } from "../rtdb/index";
import { setNetworkDelay } from "../shared";
import { auth as fireAuth } from "../auth";
import { clearAuthUsers, initializeAuth } from "../auth/state-mgmt";
import { FireMockError } from "../errors/FireMockError";
import authProviders from "../auth/client-sdk/AuthProviders";
import { getFakerLibrary, importFakerLibrary } from "./fakerInitialiation";
import { adminAuthSdk } from "../auth/admin-sdk";
/* tslint:disable:max-classes-per-file */
export class Mock {
    constructor(
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    dataOrMock, authConfig = {
        providers: ["anonymous"],
        users: [],
    }) {
        // TODO: should these attributes be removed?
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
    static async prepare(options = {}
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    ) {
        const defaultDbConfig = {};
        await importFakerLibrary();
        const obj = new Mock(options.db
            ? typeof options.db === "function"
                ? {}
                : options.db || defaultDbConfig
            : defaultDbConfig, options.auth);
        if (typeof options.db === "function") {
            obj.updateDB(await options.db(obj));
        }
        return obj;
    }
    get db() {
        return getDb();
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
    clearFirst) {
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
    async adminSdk() {
        return adminAuthSdk;
    }
    get authProviders() {
        return authProviders;
    }
    /**
     * returns an instance static FakerJS libraray
     */
    get faker() {
        return getFakerLibrary();
    }
    // /**
    //  * **getMockHelper**
    //  *
    //  * returns a MockHelper class which should always contain
    //  * access to the faker library off the `faker` property exposed;
    //  * you can also set some additional `context` where desirable.
    //  */
    // public getMockHelper(context?: IDictionary) {
    //   if (!faker && !faker.address) {
    //     throw new FireMockError(
    //       `The Faker library must be loaded before a MockHelper can be returned`,
    //       "firemock/faker-not-ready"
    //     );
    //   }
    //   return new MockHelper(context);
    // }
    addSchema(schema, mock) {
        return new Schema(schema, mock);
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
        const faker = getFakerLibrary();
        if (!faker && !faker.address) {
            throw new FireMockError(`The Faker library must be loaded before you can generate mocked data can be returned`, "firemock/faker-not-ready");
        }
        return new Deployment().generate();
    }
    ref(dbPath) {
        return new Reference(dbPath);
    }
}
//# sourceMappingURL=Mock.js.map