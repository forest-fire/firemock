/// <reference types="faker" />
import { IDictionary } from "common-types";
export declare class MockHelper {
    context?: IDictionary;
    constructor(context?: IDictionary);
    readonly faker: Faker.FakerStatic;
}
