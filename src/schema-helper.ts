export default class SchemaHelper {
  private _db: any;
  constructor(raw: any) {
    this._db = raw;
  }
  public get faker(): Faker.FakerStatic {
    const faker = require("faker");
    return faker;
  }
  public get chance(): Chance.Chance {
    const chance = require("chance");
    return chance();
  }
}
