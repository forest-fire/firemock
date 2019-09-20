"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _readOnlyPaths = [];
let _customClaims = [];
let _uidBasedPaths = [];
/**
 * Given a _path_ and Firebase _user_, determines what
 * access rights are available and passes back as a hash.
 */
function authorizePath(path, user) {
    //
    return { read: true, write: true };
}
exports.authorizePath = authorizePath;
/**
 * Provides a boolean response to whether the given _path_ is
 * readable by the given _user_.
 */
function authorizeReadOperation(path, user) {
    //
}
exports.authorizeReadOperation = authorizeReadOperation;
/**
 * Provides a boolean response to whether the given _path_ is
 * writable by the given _user_.
 */
function authorizeWriteOperation(path, user) {
    //
}
exports.authorizeWriteOperation = authorizeWriteOperation;
/**
 * Sets/resets the paths in the mock DB which are configured as
 * "read-only"
 */
function setReadOnlyPaths(paths) {
    _readOnlyPaths = paths;
}
exports.setReadOnlyPaths = setReadOnlyPaths;
/**
 * Sets/resets the paths in the mock DB which are given rights if
 * the logged in user has a "custom claim" from Firebase's Identity
 * system.
 */
function setCustomClaims(paths) {
    _customClaims = paths;
}
exports.setCustomClaims = setCustomClaims;
/**
 * Sets/resets the paths which are given rights based on the logged
 * in user's UID
 */
function setUidBasedPaths(paths) {
    _uidBasedPaths = paths;
}
exports.setUidBasedPaths = setUidBasedPaths;
//# sourceMappingURL=index.js.map