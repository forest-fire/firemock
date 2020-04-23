"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const fakerInitialiation_1 = require("./fakerInitialiation");
class MockHelper {
    constructor(context) {
        this.context = context;
    }
    get faker() {
        const faker = fakerInitialiation_1.getFakerLibrary();
        if (!faker) {
            throw common_types_1.createError(`firemock/not-ready`, `The mock helper can not provide the MockHelper object until after the faker library has been imported with a 'await importFakerLibrary()' call.`);
        }
        return faker;
    }
}
exports.MockHelper = MockHelper;
//# sourceMappingURL=MockHelper.js.map