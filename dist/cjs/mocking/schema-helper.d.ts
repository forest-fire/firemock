/// <reference types="faker" />
import { ISchemaHelper, FakerStatic } from "../@types/mocking-types";
export declare class SchemaHelper<T = any> implements ISchemaHelper<T> {
    context: T;
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
    static create<T = any>(context: T, faker?: FakerStatic): Promise<void>;
    private _faker;
    constructor(context: T, faker?: FakerStatic);
    get faker(): Faker.FakerStatic;
}
