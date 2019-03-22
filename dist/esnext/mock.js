import { Queue, Schema, Reference, Deployment } from "./index";
import { db, clearDatabase, updateDatabase } from "./database";
import { setNetworkDelay } from "./util";
import { MockHelper } from "./MockHelper";
import { auth as fireAuth } from "./auth";
import { authAdminApi } from "./auth/authAdmin";
/* tslint:disable:max-classes-per-file */
export default class Mock {
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
     * Update the mock DB with a raw JS object/hash
     */
    updateDB(state) {
        updateDatabase(state);
    }
    async auth() {
        return fireAuth();
    }
    getMockHelper() {
        return new MockHelper();
    }
    get db() {
        return db;
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
    get deploy() {
        return new Deployment();
    }
    queueSchema(schemaId, quantity = 1, overrides = {}) {
        const d = new Deployment();
        d.queueSchema(schemaId, quantity, overrides);
        return d;
    }
    generate() {
        return new Deployment().generate();
    }
    ref(dbPath) {
        return new Reference(dbPath);
    }
}
