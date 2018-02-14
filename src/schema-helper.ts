export default class SchemaHelper {
  private _db: any;
  constructor(raw: any) {
    this._db = raw;
  }
  public get faker() {
    const faker = require("faker");
    return faker;
  }
  public get chance() {
    const chance = require("chance");
    return chance();
  }
}
