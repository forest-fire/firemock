/**
 * Provides a full FirebaseAuth implementation (although many
 * parts are un-implementated currently) as well as extending
 * to add an "administrative" API for mocking
 */
export interface IMockAuth
  extends FirebaseAuth,
    IMockAdminApi,
    IAuthProviders {}

export interface IAuthProviders {
  EmailAuthProvider: EmailAuthProvider;
}

import { IMockAdminApi } from "../auth/authAdmin";
import { Mock, IDictionary } from "../index";
import { EmailAuthProvider } from "@firebase/auth-types";

export type UserCredential = import("@firebase/auth-types").UserCredential;
export type User = import("@firebase/auth-types").User;
export type AuthSettings = import("@firebase/auth-types").AuthSettings;

export type AuthCredential = import("@firebase/auth-types").AuthCredential;
export type AdditionalUserInfo = import("@firebase/auth-types").AdditionalUserInfo;
export type FirebaseAuth = import("@firebase/auth-types").FirebaseAuth;
export type FirebaseApp = import("@firebase/app-types").FirebaseApp;

/**
 * Create a user in the Auth system which can be logged in via the
 * email/password authentication style
 */
export interface IEmailUser {
  email: string;
  password: string;
  /** optionally state if the user should be considered email verified */
  verified?: boolean;
  /** optionally set a fixed UID for this user */
  uid?: string;
  /** optionally give the user a set of claims */
  claims?: string[];
}

export type IMockSetup = (mock: Mock) => () => Promise<void>;

export interface IPartialUserCredential {
  additionalUserInfo?: Partial<AdditionalUserInfo>;
  credential?: Partial<AuthCredential> | null;
  operationType?: string | null;
  user?: Partial<User> | null;
}

export interface IMockConfigOptions {
  auth?: IMockAuthConfig;
  db?: IDictionary;
}

/**
 * Provides a full FirebaseAuth implementation (although many
 * parts are un-implementated currently) as well as extending
 * to add an "administrative" API for mocking
 */
export interface IMockAuth extends FirebaseAuth, IMockAdminApi {}

/**
 * The configuration of the **Auth** mocking service
 */
export interface IMockAuthConfig {
  /**
   * create a set of users who are deemed valid for email/password
   * login; this will be used for email logins as well as email links.
   *
   * **Note:** if you set this without setting `allowEmailLogins` to true
   * it will throw a `firemock/invalid-configuration` error.
   */
  validEmailUsers?: IEmailUser[];
  /** allow anonymous logins */
  allowAnonymous?: boolean;
  /** allow email/password logins */
  allowEmailLogins?: boolean;
  /** allow logins via links sent to email */
  allowEmailLinks?: boolean;
  /** allow logins via a code sent via SMS */
  allowPhoneLogins?: boolean;
}
