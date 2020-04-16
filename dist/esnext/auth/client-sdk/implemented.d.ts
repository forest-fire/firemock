import { FirebaseAuth } from "../../@types/auth-types";
import { Omit } from "common-types";
import { notImplemented } from "./notImplemented";
export declare const implemented: Omit<FirebaseAuth, keyof typeof notImplemented>;
