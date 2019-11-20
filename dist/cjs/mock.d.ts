/// <reference types="faker" />
import { IDictionary } from "common-types";
import { Schema, Reference, Deployment, IMockSetup } from "./index";
import { DelayType } from "./util";
import { MockHelper } from "./MockHelper";
import { SchemaCallback } from "./@types/db-types";
import { IMockConfigOptions, IMockAuthConfig } from "./@types/config-types";
import { FirebaseNamespace } from "@firebase/app-types";
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
    get db(): IDictionary<any>;
    get deploy(): Deployment;
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
     * Update -- _non-desctructively_ -- the mock DB with a JS object/hash
     */
    updateDB(
    /** the _new_ state that will be updated with the old */
    stateUpdate: IDictionary, 
    /** optionally clear the DB before applying the update */
    clearFirst?: boolean): void;
    /**
     * silences the database from sending events;
     * this is not typically done but can be done
     * as part of the Mocking process to reduce noise
     */
    silenceEvents(): void;
    /**
     * returns the database to its default state of sending
     * events out.
     */
    restoreEvents(): void;
    auth(): Promise<import(".").IMockAuth>;
    get authProviders(): FirebaseNamespace["auth"];
    get faker(): Faker.FakerStatic;
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
