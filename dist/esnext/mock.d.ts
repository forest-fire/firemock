/// <reference types="faker" />
import { IDictionary } from "common-types";
import { Schema, SchemaHelper, Reference, Deployment } from "./index";
import { DelayType } from "./util";
import { MockHelper } from "./MockHelper";
import { IMockAuthConfig, IMockSetup } from "./auth/types";
export interface ISchema {
    id: string;
    /** path to the database which is the root for given schema list */
    path: () => string;
    /** mock generator function */
    fn: () => IDictionary;
    /**
     * the name of the entity being mocked, if not set then schema name
     * is assume to equal model name
     */
    modelName?: string;
    /** a static path that preceeds this schema's placement in the database */
    prefix?: string;
}
export interface IRelationship {
    id: string;
    /** cardinality type */
    type: "hasMany" | "belongsTo";
    /** the source model */
    source: string;
    /**
     * the property on the source model which is the FK
     * (by default it will use standard naming conventions)
     */
    sourceProperty: string;
    /** the model being referred to in the source model's FK */
    target: string;
}
/** Queued up schema's ready for generation */
export interface IQueue {
    id: string;
    schema: string;
    quantity: number;
    hasMany?: IDictionary<number>;
    overrides?: IDictionary;
    prefix: string;
    /** the key refers to the property name, the value true means "fulfill" */
    belongsTo?: IDictionary<boolean>;
}
/** A Schema's mock callback generator must conform to this type signature */
export declare type SchemaCallback<T = any> = (helper: SchemaHelper) => () => T;
export declare let faker: Faker.FakerStatic;
export default class Mock {
    readonly db: IDictionary<any>;
    readonly deploy: Deployment;
    /**
     * returns a Mock object while also ensuring that the
     * Faker library has been asynchronously imported.
     */
    static prepare(
    /**
     * allows publishing of raw data into the database as the databases
     * initial state or alternatively to assign a callback function which
     * will be executed when the Mock DB is "connecting" and allows the
     * DB to be setup via mocking.
     */
    dataOrMock?: IDictionary | IMockSetup, authConfig?: IMockAuthConfig): Promise<Mock>;
    private _schemas;
    private _relationships;
    private _queues;
    private _mockInitializer;
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
