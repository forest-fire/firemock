"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../mocking/index");
const index_2 = require("../rtdb/index");
const shared_1 = require("../shared");
const auth_1 = require("../auth");
const state_mgmt_1 = require("../auth/state-mgmt");
const FireMockError_1 = require("../errors/FireMockError");
const AuthProviders_1 = __importDefault(require("../auth/client-sdk/AuthProviders"));
const fakerInitialiation_1 = require("./fakerInitialiation");
const admin_sdk_1 = require("../auth/admin-sdk");
/* tslint:disable:max-classes-per-file */
class Mock {
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
        this._schemas = new index_1.Queue("schemas").clear();
        this._relationships = new index_1.Queue("relationships").clear();
        this._queues = new index_1.Queue("queues").clear();
        index_1.Queue.clearAll();
        index_2.clearDatabase();
        state_mgmt_1.clearAuthUsers();
        if (dataOrMock && typeof dataOrMock === "object") {
            this.updateDB(dataOrMock);
        }
        if (dataOrMock && typeof dataOrMock === "function") {
            this._mockInitializer = dataOrMock(this);
        }
        state_mgmt_1.initializeAuth(authConfig);
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
        await fakerInitialiation_1.importFakerLibrary();
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
        return index_2.getDb();
    }
    get deploy() {
        return new index_1.Deployment();
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
            index_2.clearDatabase();
        }
        index_2.updateDatabase(stateUpdate);
    }
    /**
     * silences the database from sending events;
     * this is not typically done but can be done
     * as part of the Mocking process to reduce noise
     */
    silenceEvents() {
        index_2.silenceEvents();
    }
    /**
     * returns the database to its default state of sending
     * events out.
     */
    restoreEvents() {
        index_2.restoreEvents();
    }
    async auth() {
        return auth_1.auth();
    }
    async adminSdk() {
        return admin_sdk_1.adminAuthSdk;
    }
    get authProviders() {
        return AuthProviders_1.default;
    }
    /**
     * returns an instance static FakerJS libraray
     */
    get faker() {
        return fakerInitialiation_1.getFakerLibrary();
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
        return new index_1.Schema(schema, mock);
    }
    /** Set the network delay for queries with "once" */
    setDelay(d) {
        shared_1.setNetworkDelay(d);
    }
    queueSchema(schemaId, quantity = 1, overrides = {}) {
        const d = new index_1.Deployment();
        d.queueSchema(schemaId, quantity, overrides);
        return d;
    }
    generate() {
        const faker = fakerInitialiation_1.getFakerLibrary();
        if (!faker && !faker.address) {
            throw new FireMockError_1.FireMockError(`The Faker library must be loaded before you can generate mocked data can be returned`, "firemock/faker-not-ready");
        }
        return new index_1.Deployment().generate();
    }
    ref(dbPath) {
        return new index_2.Reference(dbPath);
    }
}
exports.Mock = Mock;
//# sourceMappingURL=Mock.js.map