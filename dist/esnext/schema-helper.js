export default class SchemaHelper {
    constructor(raw) {
        this._db = raw;
    }
    get faker() {
        const faker = require("faker");
        return faker;
    }
    get chance() {
        const chance = require("chance");
        return chance();
    }
}
