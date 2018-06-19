/// <reference types="faker" />
/// <reference types="chance" />
export default class SchemaHelper {
    private _db;
    constructor(raw: any);
    readonly faker: Faker.FakerStatic;
    readonly chance: Chance.Chance;
}
