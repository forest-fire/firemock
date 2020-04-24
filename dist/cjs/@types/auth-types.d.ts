/**
 * Provides a full FirebaseAuth implementation (although many
 * parts are un-implementated currently) as well as extending
 * to add an "administrative" API for mocking
 */
export interface IMockAuth extends FirebaseAuth, IAuthProviders {
}
export interface IAuthProviders {
    EmailAuthProvider: EmailAuthProvider;
}
export declare type MockKlass = import("../mocking/Mock").Mock;
import { EmailAuthProvider } from "@firebase/auth-types";
import { IDictionary } from "common-types";
export declare type UserCredential = import("@firebase/auth-types").UserCredential;
export declare type User = import("@firebase/auth-types").User;
export declare type AuthSettings = import("@firebase/auth-types").AuthSettings;
export declare type AuthCredential = import("@firebase/auth-types").AuthCredential;
export declare type AuthProvider = import("@firebase/auth-types").AuthProvider;
export declare type AdditionalUserInfo = import("@firebase/auth-types").AdditionalUserInfo;
export declare type FirebaseAuth = import("@firebase/auth-types").FirebaseAuth;
export declare type FirebaseApp = import("@firebase/app-types").FirebaseApp;
export declare type IdTokenResult = import("@firebase/auth-types").IdTokenResult;
export declare type ApplicationVerifier = import("@firebase/auth-types").ApplicationVerifier;
export declare type ActionCodeSettings = import("@firebase/auth-types").ActionCodeSettings;
export declare type Auth = import("firebase-admin").auth.Auth;
export declare type CreateRequest = import("firebase-admin").auth.CreateRequest;
export declare type UserRecord = import("firebase-admin").auth.UserRecord;
export declare type UpdateRequest = import("firebase-admin").auth.UpdateRequest;
export declare type DecodedIdToken = import("firebase-admin").auth.DecodedIdToken;
export declare type ListUsersResult = import("firebase-admin").auth.ListUsersResult;
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
export declare type IMockSetup = (mock: MockKlass) => () => Promise<void>;
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
export interface IMockAuth extends FirebaseAuth {
}
/**
 * The configuration of the **Auth** mocking service
 */
export interface IMockAuthConfig {
    /** the auth providers which have been enabled for this app */
    providers: IAuthProviderName[];
    /** known users who should be in the mock Auth system to start */
    users?: ISimplifiedMockUser[];
}
export declare const enum AuthProviderName {
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
export declare type IAuthProviderName = keyof typeof AuthProviderName;
export interface IMockUser extends UserRecord {
    /** optionally set a fixed UID for this user */
    uid: string;
    isAnonymous?: boolean;
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
    phoneNumber?: string;
    photoURL?: string;
    email?: string;
    password?: string;
    /**
     * indicates whether the user has _verified_ their email ownership by clicking
     * on the verification link
     */
    emailVerified: boolean;
}
/**
 * A basic configuration for a user that allows default values to fill in some of
 * the non-essential properties which Firebase requires
 */
export declare type ISimplifiedMockUser = Omit<IMockUser, "emailVerified" | "disabled" | "uid" | "toJSON" | "providerData" | "metadata"> & {
    emailVerified?: boolean;
    disabled?: boolean;
    uid?: string;
    isAnonymous?: boolean;
};
