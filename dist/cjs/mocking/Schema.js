"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../mocking/index");
const shared_1 = require("../shared");
const fakerInitialiation_1 = require("./fakerInitialiation");
class Schema {
    constructor(schemaId, mockFn) {
        this.schemaId = schemaId;
        this._schemas = new index_1.Queue("schemas");
        this._relationships = new index_1.Queue("relationships");
        if (mockFn) {
            this.mock(mockFn);
        }
    }
    /**
     * Add a mocking function to be used to generate the schema in mock DB
     */
    mock(cb) {
        this._schemas.enqueue({
            id: this.schemaId,
            fn: cb(new index_1.SchemaHelper({}, fakerInitialiation_1.getFakerLibrary())),
            path: () => {
                const schema = this._schemas.find(this.schemaId);
                return [
                    schema.prefix,
                    schema.modelName
                        ? shared_1.pluralize(schema.modelName)
                        : shared_1.pluralize(this.schemaId)
                ].join("/");
            }
        });
        return this;
    }
    /**
     * There are times where it's appropriate to have multiple schemas for
     * the same entity/model, in this case you'll want to state what model
     * your schema is emulating. If you don't state this property it assumes
     * the schema name IS the model name
     */
    modelName(value) {
        this._schemas.update(this.schemaId, { modelName: value });
        return this;
    }
    /** prefixes a static path to the beginning of the  */
    pathPrefix(prefix) {
        prefix = prefix.replace(/\./g, "/"); // slash reference preferred over dot
        prefix =
            prefix.slice(-1) === "/" ? prefix.slice(0, prefix.length - 1) : prefix;
        this._schemas.update(this.schemaId, { prefix });
        return this;
    }
    /**
     * The default pluralizer is quite simple so if you find that
     * it is pluralizing incorrectly then you can manually state
     * the plural name.
     */
    pluralName(plural) {
        const model = this._schemas.find(this.schemaId).modelName
            ? this._schemas.find(this.schemaId).modelName
            : this.schemaId;
        shared_1.addException(model, plural);
        return this;
    }
    /**
     * Configures a "belongsTo" relationship with another schema/entity
     */
    belongsTo(target, sourceProperty) {
        this._relationships.push({
            type: "belongsTo",
            source: this.schemaId,
            target,
            sourceProperty: sourceProperty ? sourceProperty : `${target}Id`
        });
        return this;
    }
    /**
     * Configures a "hasMany" relationship with another schema/entity
     */
    hasMany(target, sourceProperty) {
        this._relationships.push({
            type: "hasMany",
            source: this.schemaId,
            target,
            sourceProperty: sourceProperty ? sourceProperty : shared_1.pluralize(target)
        });
        return this;
    }
    /** Add another schema */
    addSchema(schema, mock) {
        const s = new Schema(schema);
        if (mock) {
            s.mock(mock);
        }
        return new Schema(schema);
    }
}
exports.Schema = Schema;
//# sourceMappingURL=Schema.js.map