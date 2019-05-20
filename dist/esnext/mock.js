import { Queue, Schema, Reference, Deployment } from "./index";
import { db, clearDatabase, updateDatabase } from "./database";
import { setNetworkDelay } from "./util";
import { MockHelper } from "./MockHelper";
import { auth as fireAuth } from "./auth";
import { authAdminApi } from "./auth/authAdmin";
import { FireMockError } from "./errors/FireMockError";
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
    dataOrMock, authConfig = {
        allowAnonymous: true,
        allowEmailLogins: false,
        allowEmailLinks: false,
        allowPhoneLogins: false
    }) {
        this._schemas = new Queue("schemas").clear();
        this._relationships = new Queue("relationships").clear();
        this._queues = new Queue("queues").clear();
        Queue.clearAll();
        clearDatabase();
        if (dataOrMock && typeof dataOrMock === "object") {
            this.updateDB(dataOrMock);
        }
        if (dataOrMock && typeof dataOrMock === "function") {
            this._mockInitializer = dataOrMock(this);
        }
        authAdminApi.configureAuth(authConfig);
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
        const defaultAuthConfig = {
            allowAnonymous: true,
            allowEmailLogins: false,
            allowEmailLinks: false,
            allowPhoneLogins: false
        };
        const defaultDbConfig = {};
        const obj = new Mock(options.db || defaultDbConfig, options.auth || defaultAuthConfig);
        await obj.importFakerLibrary();
        return obj;
    }
    get db() {
        return db;
    }
    get deploy() {
        return new Deployment();
    }
    /**
     * Update the mock DB with a raw JS object/hash
     */
    updateDB(state) {
        updateDatabase(state);
    }
    async auth() {
        return fireAuth();
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
            throw new FireMockError(`The Faker library must be loaded before a MockHelper can be returned`, "firemock/faker-not-ready");
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
            throw new FireMockError(`The Faker library must be loaded before you can generate mocked data can be returned`, "firemock/faker-not-ready");
        }
        return new Deployment().generate();
    }
    ref(dbPath) {
        return new Reference(dbPath);
    }
}
