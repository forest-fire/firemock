/// <reference types="faker" />
/// <reference types="chance" />
import { IDictionary } from "common-types";
export declare class MockHelper {
    context?: IDictionary;
    constructor(context?: IDictionary);
    readonly faker: Faker.FakerStatic;
    readonly chance: Chance.Chance;
}
