"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mock_1 = require("./mock");
class SchemaHelper {
    constructor(context) {
        this.context = context;
    }
    get faker() {
        return mock_1.faker;
    }
}
exports.default = SchemaHelper;
//# sourceMappingURL=schema-helper.js.map