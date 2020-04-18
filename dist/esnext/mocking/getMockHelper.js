import { MockHelper } from "../mocking/index";
/**
 * Returns a Mock Helper object which includes the faker library.
 *
 * **Note:** calling this function will asynchronously load the faker library
 * so that the MockHelper is "made whole". This dependency has some heft to it
 * so should be avoided unless needed.
 */
export async function getMockHelper(db) {
    await db.mock.importFakerLibrary();
    const obj = new MockHelper();
    return obj;
}
//# sourceMappingURL=getMockHelper.js.map