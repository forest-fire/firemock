import { FirebaseAuth } from "./types";
import { Omit } from "common-types";
import { notImplemented } from "./notImplemented";
export declare const implemented: Omit<FirebaseAuth, keyof typeof notImplemented>;
export declare const authMockApi: import("@firebase/auth-types").FirebaseAuth;
