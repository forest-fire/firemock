"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MockHelper_1 = require("./MockHelper");
/**
 * Returns a Mock Helper object which includes the faker library.
 *
 * **Note:** calling this function will asynchronously load the faker library
 * so that the MockHelper is "made whole". This dependency has some heft to it
 * so should be avoided unless needed.
 */
async function getMockHelper(db) {
    await db.mock.importFakerLibrary();
    const obj = new MockHelper_1.MockHelper();
    return obj;
}
exports.getMockHelper = getMockHelper;
//# sourceMappingURL=getMockHelper.js.map