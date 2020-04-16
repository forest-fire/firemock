import { notImplemented } from "./notImplemented";
import { implemented } from "./implemented";
import { FirebaseAuth } from "@firebase/auth-types";

// tslint:disable-next-line:no-object-literal-type-assertion
export const authMockApi = {
  ...notImplemented,
  ...implemented
} as FirebaseAuth;
