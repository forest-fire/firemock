/// <reference types="faker" />
import { MockHelper } from "./index";
/**
 * **importFakerLibrary**
 *
 * The **faker** library is a key part of effective mocking but
 * it is a large library so we only want to import it when
 * it's required. Calling this _async_ method will ensure that
 * before you're mocking with faker available.
 */
export declare function importFakerLibrary(): Promise<Faker.FakerStatic>;
/**
 * Assuming you've already loaded the faker library, this returns the library
 * synchronously
 */
export declare function getFakerLibrary(): Faker.FakerStatic;
/**
 * Returns a Mock Helper object which includes the faker library.
 *
 * **Note:** calling this function will asynchronously load the faker library
 * so that the MockHelper is "made whole". This dependency has some heft to it
 * so should be avoided unless needed.
 */
export declare function getMockHelper(db: any): Promise<MockHelper>;
