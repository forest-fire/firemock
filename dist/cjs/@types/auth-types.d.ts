/**
 * Provides a full FirebaseAuth implementation (although many
 * parts are un-implementated currently) as well as extending
 * to add an "administrative" API for mocking
 */
export interface IMockAuth extends FirebaseAuth, IMockAdminApi, IAuthProviders {
}
export interface IAuthProviders {
    EmailAuthProvider: EmailAuthProvider;
}
import { IMockAdminApi } from "../auth/state-mgmt/authAdminApi";
import { Mock, IDictionary } from "../index";
import { EmailAuthProvider } from "@firebase/auth-types";
import { UserRecord } from "../auth/admin-sdk";
export declare type UserCredential = import("@firebase/auth-types").UserCredential;
export declare type User = import("@firebase/auth-types").User;
export declare type AuthSettings = import("@firebase/auth-types").AuthSettings;
export declare type AuthCredential = import("@firebase/auth-types").AuthCredential;
export declare type AdditionalUserInfo = import("@firebase/auth-types").AdditionalUserInfo;
export declare type FirebaseAuth = import("@firebase/auth-types").FirebaseAuth;
export declare type FirebaseApp = import("@firebase/app-types").FirebaseApp;
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
    claims?: IDictionary;
    /**
     * Optionally state token Ids which should be returned when calling
     * the `getTokenId()` method. This is useful if you have an associated
     * set of "valid (or invalid) tokens" in your testing environment.
     */
    tokenIds?: string[];
}
export declare type IMockSetup = (mock: Mock) => () => Promise<void>;
export interface IPartialUserCredential {
    additionalUserInfo?: Partial<AdditionalUserInfo>;
    credential?: Partial<AuthCredential> | null;
    operationType?: string | null;
    user?: Partial<User> | null;
}
/**
 * Provides a full FirebaseAuth implementation (although many
 * parts are un-implementated currently) as well as extending
 * to add an "administrative" API for mocking
 */
export interface IMockAuth extends FirebaseAuth, IMockAdminApi {
}
/**
 * The configuration of the **Auth** mocking service
 */
export interface IMockAuthConfig {
    providers: IAuthProvider[];
    users?: IMockUser[];
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
export declare const enum AuthProvider {
    emailPassword = "emailPassword",
    phone = "phone",
    google = "google",
    playGames = "playGames",
    gameCenter = "gameCenter",
    facebook = "facebook",
    twitter = "twitter",
    github = "github",
    yahoo = "yahoo",
    microsoft = "microsoft",
    apple = "apple",
    anonymous = "anonymous"
}
export declare type IAuthProvider = keyof typeof AuthProvider;
export interface IMockUser extends UserRecord {
    /** optionally set a fixed UID for this user */
    uid: string;
    /** optionally give the user a set of claims */
    claims?: IDictionary;
    /**
     * Optionally state token Ids which should be returned when calling
     * the `getTokenId()` method. This is useful if you have an associated
     * set of "valid (or invalid) tokens" in your testing environment.
     */
    tokenIds?: string[];
    displayName?: string;
    disabled: boolean;
    phoneNumber?: string | null;
    photoURL?: string | null;
    email?: string;
    password: string;
    /**
     * indicates whether the user has _verified_ their email ownership by clicking
     * on the verification link
     */
    emailVerified: boolean;
}
