import { IDictionary } from "common-types";
import { IMockAuthConfig } from "./auth-types";
import { Mock } from "..";

/** an _async_ mock function which returns a dictionary data structure */
export type AsyncMockData = (db: Mock) => Promise<IDictionary>;

export interface IMockConfigOptions {
  auth?: IMockAuthConfig;
  /**
   * Sets the initial state of the mock database, or optionally you can
   * pass in an async function which will resolve into the state of the
   * database.
   */
  db?: IDictionary | AsyncMockData;
}

export interface IMockFirebaseUidOnlyPath<T extends object = IDictionary>
  extends IMockFirebasePathPermission {
  /**
   * the _property_ on the list of records which holds
   * a reference to the `uid` property. If not stated
   * the the default property name will be **uid**.
   */
  uidProperty?: keyof T;
}

export interface IMockFirebaseCustomClaimPath<T extends object = IDictionary>
  extends IMockFirebasePathPermission {
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
