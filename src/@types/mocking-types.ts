export type FakerStatic = typeof import("faker");

export interface ISchemaHelper<T = any> {
  context: T;
  faker: Faker.FakerStatic;
}
