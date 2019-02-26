import { IDictionary } from "common-types";

export class MockHelper {
  constructor(public context?: IDictionary) {}

  public get faker(): Faker.FakerStatic {
    const faker = require("faker");
    return faker;
  }
}
