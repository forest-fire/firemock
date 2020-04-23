import { Mock, MockHelper } from "./index";
import { FakerStatic } from "../@types";
import { FireMockError } from "../errors/FireMockError";

let faker: FakerStatic;

/**
 * **importFakerLibrary**
 *
 * The **faker** library is a key part of effective mocking but
 * it is a large library so we only want to import it when
 * it's required. Calling this _async_ method will ensure that
 * before you're mocking with faker available.
 */
export async function importFakerLibrary() {
  if (!faker) {
    faker = await import(/* webpackChunkName: "faker-lib" */ "faker");
  }
  return faker;
}

/**
 * Assuming you've already loaded the faker library, this returns the library
 * synchronously
 */
export function getFakerLibrary() {
  if (!faker) {
    throw new FireMockError(
      `The faker library has not been loaded yet! Use the importFakerLibrary() directly to ensure this happens first;or altnernatively you can use Mock.prepare().`,
      "not-ready"
    );
  }

  return faker;
}

/**
 * Returns a Mock Helper object which includes the faker library.
 *
 * **Note:** calling this function will asynchronously load the faker library
 * so that the MockHelper is "made whole". This dependency has some heft to it
 * so should be avoided unless needed.
 */
export async function getMockHelper(db: any) {
  faker = await importFakerLibrary();
  const obj = new MockHelper();
  return obj;
}
