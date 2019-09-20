let _readOnlyPaths = [];
let _customClaims = [];
let _uidBasedPaths = [];
/**
 * Given a _path_ and Firebase _user_, determines what
 * access rights are available and passes back as a hash.
 */
export function authorizePath(path, user) {
    //
    return { read: true, write: true };
}
/**
 * Provides a boolean response to whether the given _path_ is
 * readable by the given _user_.
 */
export function authorizeReadOperation(path, user) {
    //
}
/**
 * Provides a boolean response to whether the given _path_ is
 * writable by the given _user_.
 */
export function authorizeWriteOperation(path, user) {
    //
}
/**
 * Sets/resets the paths in the mock DB which are configured as
 * "read-only"
 */
export function setReadOnlyPaths(paths) {
    _readOnlyPaths = paths;
}
/**
 * Sets/resets the paths in the mock DB which are given rights if
 * the logged in user has a "custom claim" from Firebase's Identity
 * system.
 */
export function setCustomClaims(paths) {
    _customClaims = paths;
}
/**
 * Sets/resets the paths which are given rights based on the logged
 * in user's UID
 */
export function setUidBasedPaths(paths) {
    _uidBasedPaths = paths;
}
//# sourceMappingURL=index.js.map