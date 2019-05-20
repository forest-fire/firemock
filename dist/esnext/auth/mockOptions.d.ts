import { IMockAuthConfig } from "./types";
import { IDictionary } from "common-types";
export interface IMockConfigOptions {
    auth?: IMockAuthConfig;
    db?: IDictionary;
}
