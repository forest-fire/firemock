"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SchemaHelper {
    constructor(raw) {
        this._db = raw;
    }
    get faker() {
        const faker = require("faker");
        return faker;
    }
}
exports.default = SchemaHelper;
//# sourceMappingURL=schema-helper.js.map