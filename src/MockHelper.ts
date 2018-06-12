import { IDictionary } from "common-types";

export class MockHelper {
  constructor(public context: IDictionary) {}

  public get faker(): Faker.FakerStatic {
    const faker = require("faker");
    return faker;
  }
  public get chance(): Chance.Chance {
    const chance = require("chance");
    return chance();
  }
}
