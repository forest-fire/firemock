/// <reference types="faker" />
import { IDictionary } from "common-types";
import { Schema, Reference, Deployment } from "./index";
import { DelayType } from "./util";
import { MockHelper } from "./MockHelper";
import { IMockAuthConfig, IMockSetup } from "./auth/types";
import { IMockConfigOptions } from "./auth/mockOptions";
import { SchemaCallback } from "./types";
export declare let faker: Faker.FakerStatic;
export declare class Mock {
    /**
     * returns a Mock object while also ensuring that the
     * Faker library has been asynchronously imported.
     */
    static prepare(options?: IMockConfigOptions
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    ): Promise<Mock>;
    readonly db: IDictionary<any>;
    readonly deploy: Deployment;
    private _schemas;
    private _relationships;
    private _queues;
    private _mockInitializer;
    private _fakerLoaded;
    constructor(
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    dataOrMock?: IDictionary | IMockSetup, authConfig?: IMockAuthConfig);
    /**
     * Update the mock DB with a raw JS object/hash
     */
    updateDB(state: IDictionary): void;
    auth(): Promise<import(".").IMockAuth>;
    readonly faker: Faker.FakerStatic;
    /**
     * **importFakerLibrary**
     *
     * The **faker** library is a key part of effective mocking but
     * it is a large library so we only want to import it when
     * it's required. Calling this _async_ method will ensure that
     * before you're mocking with faker available.
     */
    importFakerLibrary(): Promise<void>;
    /**
     * **getMockHelper**
     *
     * returns a MockHelper class which should always contain
     * access to the faker library off the `faker` property exposed;
     * you can also set some additional `context` where desirable.
     */
    getMockHelper(context?: IDictionary): MockHelper;
    addSchema<S = any>(schema: string, mock?: SchemaCallback): Schema<S>;
    /** Set the network delay for queries with "once" */
    setDelay(d: DelayType): void;
    queueSchema<T = any>(schemaId: string, quantity?: number, overrides?: IDictionary): Deployment;
    generate(): void;
    ref<T = any>(dbPath: string): Reference<T>;
}
