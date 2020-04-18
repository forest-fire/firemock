import { ISchemaHelper, FakerStatic } from "../@types/mocking-types";

export class SchemaHelper<T = any> implements ISchemaHelper<T> {
  /**
   * static initializer which allows the **faker** library
   * to be instantiated asynchronously. Alternatively,
   * you can pass in an instance of faker to this function
   * to avoid any need for delay.
   *
   * Note: the _constructor_ also allows passing the faker
   * library in so this initializer's main "value" is to
   * ensure that faker is ready before the faker getter is
   * used.
   */
  static async create<T = any>(context: T, faker?: FakerStatic) {
    const obj = new SchemaHelper(context, faker);
  }

  private _faker: FakerStatic;

  constructor(public context: T, faker?: FakerStatic) {
    if (faker) {
      this._faker = faker;
    }
  }
  public get faker(): Faker.FakerStatic {
    return this._faker;
  }
}
