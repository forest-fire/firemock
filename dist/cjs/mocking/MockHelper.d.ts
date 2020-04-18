/// <reference types="faker" />
import { IDictionary } from "common-types";
export declare class MockHelper {
    context?: IDictionary;
    constructor(context?: IDictionary);
    get faker(): Faker.FakerStatic;
}
