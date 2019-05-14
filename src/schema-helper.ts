import { faker } from "./mock";

export default class SchemaHelper {
  constructor(public context: any) {}
  public get faker(): Faker.FakerStatic {
    return faker;
  }
}
