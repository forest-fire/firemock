import { SerializedQuery } from "serialized-query";
export declare function startAt(query: SerializedQuery): (record: any) => boolean;
export declare function endAt(query: SerializedQuery): (record: any) => boolean;
/** a filter function for queries with a `equalTo` value */
export declare function equalTo(query: SerializedQuery): (record: any) => boolean;
