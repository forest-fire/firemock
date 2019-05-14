"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const mock_1 = require("./mock");
class MockHelper {
    constructor(context) {
        this.context = context;
    }
    get faker() {
        if (!mock_1.faker) {
            throw common_types_1.createError(`firemock/not-ready`, `The mock helper can not provide the MockHelper object until after the faker library has been imported with a 'await importFakerLibrary()' call.`);
        }
        return mock_1.faker;
    }
}
exports.MockHelper = MockHelper;
//# sourceMappingURL=MockHelper.js.map