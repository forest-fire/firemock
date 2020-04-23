"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const FireMockError_1 = require("../errors/FireMockError");
let faker;
/**
 * **importFakerLibrary**
 *
 * The **faker** library is a key part of effective mocking but
 * it is a large library so we only want to import it when
 * it's required. Calling this _async_ method will ensure that
 * before you're mocking with faker available.
 */
async function importFakerLibrary() {
    if (!faker) {
        faker = await Promise.resolve().then(() => __importStar(require(/* webpackChunkName: "faker-lib" */ "faker")));
    }
    return faker;
}
exports.importFakerLibrary = importFakerLibrary;
/**
 * Assuming you've already loaded the faker library, this returns the library
 * synchronously
 */
function getFakerLibrary() {
    if (!faker) {
        throw new FireMockError_1.FireMockError(`The faker library has not been loaded yet! Use the importFakerLibrary() directly to ensure this happens first;or altnernatively you can use Mock.prepare().`, "not-ready");
    }
    return faker;
}
exports.getFakerLibrary = getFakerLibrary;
/**
 * Returns a Mock Helper object which includes the faker library.
 *
 * **Note:** calling this function will asynchronously load the faker library
 * so that the MockHelper is "made whole". This dependency has some heft to it
 * so should be avoided unless needed.
 */
async function getMockHelper(db) {
    faker = await importFakerLibrary();
    const obj = new index_1.MockHelper();
    return obj;
}
exports.getMockHelper = getMockHelper;
//# sourceMappingURL=fakerInitialiation.js.map