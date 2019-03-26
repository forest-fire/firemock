"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const database_1 = require("./database");
const util_1 = require("./util");
const MockHelper_1 = require("./MockHelper");
const auth_1 = require("./auth");
const authAdmin_1 = require("./auth/authAdmin");
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
        allowAnonymous: true,
        allowEmailLogins: false,
        allowEmailLinks: false,
        allowPhoneLogins: false
    }) {
        this._schemas = new index_1.Queue("schemas").clear();
        this._relationships = new index_1.Queue("relationships").clear();
        this._queues = new index_1.Queue("queues").clear();
        index_1.Queue.clearAll();
        database_1.clearDatabase();
        if (dataOrMock && typeof dataOrMock === "object") {
            this.updateDB(dataOrMock);
        }
        if (dataOrMock && typeof dataOrMock === "function") {
            this._mockInitializer = dataOrMock(this);
        }
        authAdmin_1.authAdminApi.configureAuth(authConfig);
    }
    get db() {
        return database_1.db;
    }
    get deploy() {
        return new index_1.Deployment();
    }
    /**
     * returns a Mock object while also ensuring that the
     * Faker library has been asynchronously imported.
     */
    static async prepare(
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
        const obj = new Mock(dataOrMock, authConfig);
        await obj.importFakerLibrary();
        return obj;
    }
    /**
     * Update the mock DB with a raw JS object/hash
     */
    updateDB(state) {
        database_1.updateDatabase(state);
    }
    async auth() {
        return auth_1.auth();
    }
    async importFakerLibrary() {
        if (!exports.faker) {
            exports.faker = await Promise.resolve().then(() => __importStar(require("faker")));
        }
    }
    async getMockHelper() {
        if (!exports.faker) {
            exports.faker = await Promise.resolve().then(() => __importStar(require("faker")));
        }
        return new MockHelper_1.MockHelper();
    }
    addSchema(schema, mock) {
        const s = new index_1.Schema(schema);
        if (mock) {
            s.mock(mock);
        }
        return new index_1.Schema(schema);
    }
    /** Set the network delay for queries with "once" */
    setDelay(d) {
        util_1.setNetworkDelay(d);
    }
    queueSchema(schemaId, quantity = 1, overrides = {}) {
        const d = new index_1.Deployment();
        d.queueSchema(schemaId, quantity, overrides);
        return d;
    }
    generate() {
        return new index_1.Deployment().generate();
    }
    ref(dbPath) {
        return new index_1.Reference(dbPath);
    }
}
exports.default = Mock;
//# sourceMappingURL=mock.js.map