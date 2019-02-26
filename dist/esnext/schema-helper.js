export default class SchemaHelper {
    constructor(raw) {
        this._db = raw;
    }
    get faker() {
        const faker = require("faker");
        return faker;
    }
}
