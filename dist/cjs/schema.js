"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = __importDefault(require("./queue"));
const schema_helper_1 = __importDefault(require("./schema-helper"));
const pluralize_1 = __importStar(require("./pluralize"));
class Schema {
    constructor(schemaId) {
        this.schemaId = schemaId;
        this._schemas = new queue_1.default("schemas");
        this._relationships = new queue_1.default("relationships");
        this._prefix = "";
    }
    /**
     * Add a mocking function to be used to generate the schema in mock DB
     */
    mock(cb) {
        this._schemas.enqueue({
            id: this.schemaId,
            fn: cb(new schema_helper_1.default({})),
            path: () => {
                const schema = this._schemas.find(this.schemaId);
                return [
                    schema.prefix,
                    schema.modelName ? pluralize_1.default(schema.modelName) : pluralize_1.default(this.schemaId)
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
        prefix = prefix.slice(-1) === "/" ? prefix.slice(0, prefix.length - 1) : prefix;
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
        pluralize_1.addException(model, plural);
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
            sourceProperty: sourceProperty ? sourceProperty : pluralize_1.default(target)
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
exports.default = Schema;
//# sourceMappingURL=schema.js.map