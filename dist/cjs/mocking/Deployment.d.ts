export declare class Deployment {
    private schemaId;
    private queueId;
    private _queue;
    private _schemas;
    private _relationships;
    /**
     * Queue a schema for deployment to the mock DB
     */
    queueSchema<T = any>(
    /** A unique reference to the schema being queued for generation */
    schemaId: string, 
    /** The number of this schema to generate */
    quantity?: number, 
    /** Properties in the schema template which should be overriden with a static value */
    overrides?: Partial<T>): this;
    /**
     * Provides specificity around how many of a given
     * "hasMany" relationship should be fulfilled of
     * the schema currently being queued.
     */
    quantifyHasMany(targetSchema: string, quantity: number): this;
    /**
     * Indicates the a given "belongsTo" should be fulfilled with a
     * valid FK reference when this queue is generated.
     */
    fulfillBelongsTo(targetSchema: string): this;
    generate(): void;
    /**
     * Adds in a given record/mock into the mock database
     */
    private insertMockIntoDB;
    private insertRelationshipLinks;
}
