import { SerializedQuery } from "serialized-query";
/** an filter function for queries with a `limitToFirst` value */
export declare function limitToFirst(query: SerializedQuery): (list: any[]) => any[];
/** an filter function for queries with a `limitToLast` value */
export declare function limitToLast(query: SerializedQuery): (list: any[]) => any[];
