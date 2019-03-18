import { IDictionary } from "common-types";
import { Schema, SchemaHelper, Reference, Deployment } from "./index";
import { DelayType } from "./util";
import { MockHelper } from "./MockHelper";
import { IAuthConfig } from "./auth";
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
export default class Mock {
    private _schemas;
    private _relationships;
    private _queues;
    constructor(raw?: IDictionary, authConfig?: IAuthConfig);
    /**
     * Update the mock DB with a raw JS object/hash
     */
    updateDB(state: IDictionary): void;
    getMockHelper(): MockHelper;
    readonly db: IDictionary<any>;
    addSchema<S = any>(schema: string, mock?: SchemaCallback): Schema<S>;
    /** Set the network delay for queries with "once" */
    setDelay(d: DelayType): void;
    readonly deploy: Deployment;
    queueSchema<T = any>(schemaId: string, quantity?: number, overrides?: IDictionary): Deployment;
    generate(): void;
    ref<T = any>(dbPath: string): Reference<T>;
}
