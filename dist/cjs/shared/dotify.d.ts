import { IDictionary } from "common-types";
export declare const dotify: (path: string) => string;
export declare function dotifyKeys(obj: IDictionary): IDictionary<any>;
export declare function removeDotsAtExtremes(path: string): string;
