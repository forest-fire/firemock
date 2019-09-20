import { IDictionary } from "common-types";
import { IEmailUser } from "./auth-types";
export interface IMockConfigOptions {
    auth?: IMockAuthConfig;
    db?: IDictionary;
}
export interface IMockAuthConfig {
    /**
     * a list of email logins which are already setup as valid
     * in the mock authentication module; this will be used for
     * email logins as well as email links
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
export interface IMockFirebaseUidOnlyPath<T extends object = IDictionary> extends IMockFirebasePathPermission {
    /**
     * the _property_ on the list of records which holds
     * a reference to the `uid` property. If not stated
     * the the default property name will be **uid**.
     */
    uidProperty?: keyof T;
}
export interface IMockFirebaseCustomClaimPath<T extends object = IDictionary> extends IMockFirebasePathPermission {
    /**
     * The claim which will unlock this permission grant
     */
    claim: string;
}
export interface IMockFirebasePathPermission {
    /**
     * a path in the database which will point to a list of
     * records.
     */
    path: string;
    /**
     * whether a matched _uid_ should gain "read" permission
     * to the record. Default is `false`.
     */
    read?: boolean;
    /**
     * whether a matched _uid_ should gain "write" permission
     * to the record. Default is `false`.
     */
    write?: boolean;
    /**
     * Allows the creation of a new record with the given users
     * `uid` but once created does not provide any permissions
     * to the record for updates (or even reading)
     *
     * These permissions can be granted separately if this is
     * desirable but sometimes you only want a user to be create
     * a record and then lose all rights to that record; an example of
     * this might an _audit_ table record.
     */
    create?: boolean;
}
