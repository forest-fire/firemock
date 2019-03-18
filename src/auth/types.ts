import { authMockApi } from "./authMock";
import { authAdminApi, IMockAdminApi } from "./authAdmin";

export type UserCredential = import("@firebase/auth-types").UserCredential;
export type User = import("@firebase/auth-types").User;
export type AuthCredential = import("@firebase/auth-types").AuthCredential;
export type AdditionalUserInfo = import("@firebase/auth-types").AdditionalUserInfo;
export type FirebaseAuth = import("@firebase/auth-types").FirebaseAuth;
export type FirebaseApp = import("@firebase/app-types").FirebaseApp;

export interface IEmailLogin {
  email: string;
  password: string;
}

export interface IAuthConfig {
  validEmailLogins?: IEmailLogin[];
  allowAnonymous?: boolean;
  allowEmailLogins?: boolean;
  allowEmailLinks?: boolean;
  allowPhoneLogins?: boolean;
}

export interface IPartialUserCredential {
  additionalUserInfo?: Partial<AdditionalUserInfo>;
  credential?: Partial<AuthCredential> | null;
  operationType?: string | null;
  user?: Partial<User> | null;
}

/**
 * Provides a full FirebaseAuth implementation (although many
 * parts are false implementations currently) as well as extending
 * to add an "administrative" API for mocking
 */
export interface IMockAuth extends FirebaseAuth, IMockAdminApi {}
