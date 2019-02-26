import { IDictionary } from "common-types";
import { DataSnapshot } from "@firebase/database-types";
export declare function normalizeRef(r: string): string;
export declare function parts(r: string): string[];
/**
 * return the last component of the path
 * which typically would represent the 'id'
 * of a list-node
 */
export declare function leafNode(r: string): string;
export declare function getRandomInt(min: number, max: number): number;
export declare function firstProp<T = IDictionary>(listOf: IDictionary<any>): any;
export declare function lastProp<T = IDictionary>(listOf: IDictionary<any>): T;
export declare function objectIndex(obj: IDictionary, index: number): any;
export declare function firstKey<T = any>(listOf: IDictionary<T>): string;
export declare function lastKey<T = any>(listOf: IDictionary<T>): string;
export declare function removeKeys(obj: IDictionary, remove: string[]): {};
/**
 * Joins a set of paths together and converts into
 * correctly formatted "dot notation" directory path
 */
export declare function join(...paths: string[]): string;
export declare function pathDiff(longPath: string, pathSubset: string): string;
export declare function orderedSnapToJS<T = any>(snap: DataSnapshot): IDictionary<T>;
/**
 * Given a path, returns the parent path and child key
 */
export declare function keyAndParent(dotPath: string): {
    parent: string;
    key: string;
};
/** converts a '/' delimited path to a '.' delimited one */
export declare function dotNotation(path: string): string;
export declare function slashNotation(path: string): string;
/** Get the parent DB path */
export declare function getParent(dotPath: string): string;
/** Get the Key from the end of a path string */
export declare function getKey(dotPath: string): string;
/** named network delays */
export declare enum Delays {
    random = "random",
    weak = "weak-mobile",
    mobile = "mobile",
    WiFi = "WIFI"
}
export declare type DelayType = number | number[] | IDictionary<number> | Delays;
export declare function setNetworkDelay(value: IDictionary | number | number[] | Delays): void;
export declare function networkDelay<T = any>(returnValue?: any): Promise<T>;
