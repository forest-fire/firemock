import {
  IMockFirebaseCustomClaimPath,
  IMockFirebaseUidOnlyPath
} from "../@types/config-types";
import { User } from "../@types/auth-types";

let _readOnlyPaths: string[] = [];
let _customClaims: IMockFirebaseCustomClaimPath[] = [];
let _uidBasedPaths: IMockFirebaseUidOnlyPath[] = [];

/**
 * Given a _path_ and Firebase _user_, determines what
 * access rights are available and passes back as a hash.
 */
export function authorizePath(path: string, user: User) {
  //
  return { read: true, write: true };
}

/**
 * Provides a boolean response to whether the given _path_ is
 * readable by the given _user_.
 */
export function authorizeReadOperation(path: string, user: User) {
  //
}

/**
 * Provides a boolean response to whether the given _path_ is
 * writable by the given _user_.
 */
export function authorizeWriteOperation(path: string, user: User) {
  //
}

/**
 * Sets/resets the paths in the mock DB which are configured as
 * "read-only"
 */
export function setReadOnlyPaths(paths: string[]) {
  _readOnlyPaths = paths;
}

/**
 * Sets/resets the paths in the mock DB which are given rights if
 * the logged in user has a "custom claim" from Firebase's Identity
 * system.
 */
export function setCustomClaims(paths: IMockFirebaseCustomClaimPath[]) {
  _customClaims = paths;
}

/**
 * Sets/resets the paths which are given rights based on the logged
 * in user's UID
 */
export function setUidBasedPaths(paths: IMockFirebaseUidOnlyPath[]) {
  _uidBasedPaths = paths;
}
