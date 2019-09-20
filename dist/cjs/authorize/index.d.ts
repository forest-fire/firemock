import { IMockFirebaseCustomClaimPath, IMockFirebaseUidOnlyPath } from "../@types/config-types";
import { User } from "../@types/auth-types";
/**
 * Given a _path_ and Firebase _user_, determines what
 * access rights are available and passes back as a hash.
 */
export declare function authorizePath(path: string, user: User): {
    read: boolean;
    write: boolean;
};
/**
 * Provides a boolean response to whether the given _path_ is
 * readable by the given _user_.
 */
export declare function authorizeReadOperation(path: string, user: User): void;
/**
 * Provides a boolean response to whether the given _path_ is
 * writable by the given _user_.
 */
export declare function authorizeWriteOperation(path: string, user: User): void;
/**
 * Sets/resets the paths in the mock DB which are configured as
 * "read-only"
 */
export declare function setReadOnlyPaths(paths: string[]): void;
/**
 * Sets/resets the paths in the mock DB which are given rights if
 * the logged in user has a "custom claim" from Firebase's Identity
 * system.
 */
export declare function setCustomClaims(paths: IMockFirebaseCustomClaimPath[]): void;
/**
 * Sets/resets the paths which are given rights based on the logged
 * in user's UID
 */
export declare function setUidBasedPaths(paths: IMockFirebaseUidOnlyPath[]): void;
