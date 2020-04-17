"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fbKey = __importStar(require("firebase-key"));
const lodash_set_1 = __importDefault(require("lodash.set"));
const lodash_get_1 = __importDefault(require("lodash.get"));
const lodash_first_1 = __importDefault(require("lodash.first"));
const util_1 = require("../shared/util");
const Queue_1 = require("./Queue");
const pluralize_1 = __importDefault(require("../shared/pluralize"));
const database_1 = require("../rtdb/database");
class Deployment {
    constructor() {
        this._queue = new Queue_1.Queue("queue");
        this._schemas = new Queue_1.Queue("schemas");
        this._relationships = new Queue_1.Queue("relationships");
    }
    /**
     * Queue a schema for deployment to the mock DB
     */
    queueSchema(
    /** A unique reference to the schema being queued for generation */
    schemaId, 
    /** The number of this schema to generate */
    quantity = 1, 
    /** Properties in the schema template which should be overriden with a static value */
    overrides = {}) {
        this.schemaId = schemaId;
        this.queueId = fbKey.key();
        const schema = this._schemas.find(schemaId);
        if (!schema) {
            console.log(`Schema "${schema}" does not exist; will SKIP.`);
        }
        else {
            const newQueueItem = {
                id: this.queueId,
                schema: schemaId,
                prefix: schema.prefix,
                quantity,
                overrides
            };
            this._queue.enqueue(newQueueItem);
        }
        return this;
    }
    /**
     * Provides specificity around how many of a given
     * "hasMany" relationship should be fulfilled of
     * the schema currently being queued.
     */
    quantifyHasMany(targetSchema, quantity) {
        const hasMany = this._relationships.filter(r => r.type === "hasMany" && r.source === this.schemaId);
        const targetted = hasMany.filter(r => r.target === targetSchema);
        if (hasMany.length === 0) {
            console.log(`Attempt to quantify "hasMany" relationships with schema "${this.schemaId}" is not possible; no such relationships exist`);
        }
        else if (targetted.length === 0) {
            console.log(`The "${targetSchema}" schema does not have a "hasMany" relationship with the "${this.schemaId}" model`);
        }
        else {
            const queue = this._queue.find(this.queueId);
            this._queue.update(this.queueId, {
                hasMany: Object.assign(Object.assign({}, queue.hasMany), { [pluralize_1.default(targetSchema)]: quantity })
            });
        }
        return this;
    }
    /**
     * Indicates the a given "belongsTo" should be fulfilled with a
     * valid FK reference when this queue is generated.
     */
    fulfillBelongsTo(targetSchema) {
        const schema = this._schemas.find(this.schemaId);
        const relationship = lodash_first_1.default(this._relationships
            .filter(r => r.source === this.schemaId)
            .filter(r => r.target === targetSchema));
        const sourceProperty = schema.path();
        const queue = this._queue.find(this.queueId);
        this._queue.update(this.queueId, {
            belongsTo: Object.assign(Object.assign({}, queue.belongsTo), { [`${targetSchema}Id`]: true })
        });
        return this;
    }
    generate() {
        this._queue.map((q) => {
            for (let i = q.quantity; i > 0; i--) {
                this.insertMockIntoDB(q.schema, q.overrides);
            }
        });
        this._queue.map((q) => {
            for (let i = q.quantity; i > 0; i--) {
                this.insertRelationshipLinks(q);
            }
        });
        this._queue.clear();
    }
    insertMockIntoDB(schemaId, overrides) {
        const schema = this._schemas.find(schemaId);
        const mock = schema.fn();
        const path = schema.path();
        const key = overrides.id || fbKey.key();
        lodash_set_1.default(database_1.db, util_1.dotNotation(path) + `.${key}`, typeof mock === "object"
            ? Object.assign(Object.assign({}, mock), overrides) : overrides && typeof overrides !== "object"
            ? overrides
            : mock);
        return key;
    }
    insertRelationshipLinks(queue) {
        const relationships = this._relationships.filter(r => r.source === queue.schema);
        const belongsTo = relationships.filter(r => r.type === "belongsTo");
        const hasMany = relationships.filter(r => r.type === "hasMany");
        belongsTo.forEach(r => {
            const fulfill = Object.keys(queue.belongsTo || {})
                .filter(v => queue.belongsTo[v] === true)
                .indexOf(r.sourceProperty) !== -1;
            const source = this._schemas.find(r.source);
            const target = this._schemas.find(r.target);
            let getID;
            if (fulfill) {
                const mockAvailable = this._schemas.find(r.target) ? true : false;
                const available = Object.keys(database_1.db[pluralize_1.default(r.target)] || {});
                const generatedAvailable = available.length > 0;
                const numChoices = (database_1.db[r.target] || []).length;
                const choice = () => generatedAvailable
                    ? available[util_1.getRandomInt(0, available.length - 1)]
                    : this.insertMockIntoDB(r.target, {});
                getID = () => mockAvailable
                    ? generatedAvailable
                        ? choice()
                        : this.insertMockIntoDB(r.target, {})
                    : fbKey.key();
            }
            else {
                getID = () => "";
            }
            const property = r.sourceProperty;
            const path = source.path();
            const recordList = lodash_get_1.default(database_1.db, util_1.dotNotation(source.path()), {});
            Object.keys(recordList).forEach(key => {
                lodash_set_1.default(database_1.db, `${util_1.dotNotation(source.path())}.${key}.${property}`, getID());
            });
        });
        hasMany.forEach(r => {
            const fulfill = Object.keys(queue.hasMany || {}).indexOf(r.sourceProperty) !== -1;
            const howMany = fulfill ? queue.hasMany[r.sourceProperty] : 0;
            const source = this._schemas.find(r.source);
            const target = this._schemas.find(r.target);
            let getID;
            if (fulfill) {
                const mockAvailable = this._schemas.find(r.target) ? true : false;
                const available = Object.keys(database_1.db[pluralize_1.default(r.target)] || {});
                const used = [];
                const generatedAvailable = available.length > 0;
                const numChoices = (database_1.db[pluralize_1.default(r.target)] || []).length;
                const choice = (pool) => {
                    if (pool.length > 0) {
                        const chosen = pool[util_1.getRandomInt(0, pool.length - 1)];
                        used.push(chosen);
                        return chosen;
                    }
                    return this.insertMockIntoDB(r.target, {});
                };
                getID = () => mockAvailable
                    ? choice(available.filter(a => used.indexOf(a) === -1))
                    : fbKey.key();
            }
            else {
                getID = () => undefined;
            }
            const property = r.sourceProperty;
            const path = source.path();
            const sourceRecords = lodash_get_1.default(database_1.db, util_1.dotNotation(source.path()), {});
            Object.keys(sourceRecords).forEach(key => {
                for (let i = 1; i <= howMany; i++) {
                    lodash_set_1.default(database_1.db, `${util_1.dotNotation(source.path())}.${key}.${property}.${getID()}`, true);
                }
            });
        });
    }
}
exports.Deployment = Deployment;
//# sourceMappingURL=Deployment.js.map