import Chance = require('chance');
import * as faker from 'faker';

export default class SchemaHelper {
  private _db: any;
  constructor(raw: any) {
    this._db = raw;
  }
  public get faker() {
    return faker;
  }
  public get chance() {
    return Chance.Chance();
  }
}