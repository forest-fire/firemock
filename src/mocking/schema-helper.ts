import { faker } from "./index";

export class SchemaHelper {
  constructor(public context: any) {}
  public get faker(): Faker.FakerStatic {
    return faker;
  }
}
