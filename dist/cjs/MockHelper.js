"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockHelper {
    constructor(context) {
        this.context = context;
    }
    get faker() {
        const faker = require("faker");
        return faker;
    }
}
exports.MockHelper = MockHelper;
//# sourceMappingURL=MockHelper.js.map