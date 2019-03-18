import { Queue, Schema, Reference, Deployment } from "./index";
import { db, clearDatabase, updateDatabase } from "./database";
import { setNetworkDelay } from "./util";
import { MockHelper } from "./MockHelper";
import { auth as fireAuth } from "./auth";
import { authAdminApi } from "./auth/authAdmin";
/* tslint:disable:max-classes-per-file */
export default class Mock {
    constructor(raw, authConfig = {
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
        if (raw) {
            this.updateDB(raw);
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
