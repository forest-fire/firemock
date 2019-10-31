"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../auth");
const authMockHelpers_1 = require("./authMockHelpers");
const FireMockError_1 = require("../errors/FireMockError");
/**
 * The **Auth** configuration dictionary
 */
let authConfig = {
    allowAnonymous: true
};
function clearAuthUsers() {
    authConfig.validEmailUsers = [];
}
exports.clearAuthUsers = clearAuthUsers;
let ANONYMOUS_USER_ID;
/**
 * callbacks sent in for callback when the
 * _auth_ state changes.
 */
const authObservers = [];
/**
 * The currently logged in user
 */
let currentUser;
exports.authAdminApi = {
    /**
     * Updates the Auth configuration
     *
     * @param config the new config parameters passed in
     */
    configureAuth(config) {
        authConfig = Object.assign(Object.assign({}, authConfig), config);
    },
    getValidEmailUsers() {
        return authConfig.validEmailUsers || [];
    },
    getAuthConfig() {
        return authConfig;
    },
    addUserToAuth(u, p) {
        authConfig.validEmailUsers.push({
            email: u.email,
            password: p,
            uid: u.uid,
            verified: u.emailVerified
        });
    },
    updateEmailUser(email, updates) {
        let found = false;
        authConfig.validEmailUsers = authConfig.validEmailUsers.map(i => {
            if (i.email === email) {
                found = true;
                return Object.assign(Object.assign({}, i), updates);
            }
            return i;
        });
        if (!found) {
            throw new FireMockError_1.FireMockError(`Attempt to update email [${email}] failed because that user was not a known user email!`, "auth/not-found");
        }
    },
    /**
     * For an already existing user in the Auth user pool, allows
     * the addition of _custom claims_.
     */
    grantUserCustomClaims(email, claims) {
        exports.authAdminApi.updateEmailUser(email, { claims });
    },
    /**
     * State explicitly what UID an anonymous user
     * should get; if not stated the default is to
     * generate a random UID.
     */
    setAnonymousUid(uid) {
        ANONYMOUS_USER_ID = uid;
        return auth_1.authApi;
    },
    /**
     * Gets a UID for an anonymous user; this UID will
     * be randomly generated unless it has been set
     * statically with the `setAnonymousUid()` method
     */
    getAnonymousUid() {
        return ANONYMOUS_USER_ID ? ANONYMOUS_USER_ID : authMockHelpers_1.createUid();
    },
    /**
     * Retrieve the currently logged in user
     */
    getCurrentUser() {
        return currentUser;
    },
    /**
     * Set the current user to a new user and notify all
     * observers of the `onAuth` event
     *
     * @param u the new `User` who has logged in
     */
    login(u) {
        currentUser = u;
        authObservers.map(o => o(u));
    },
    /**
     * Clear the current user and notify all observers of the
     * `onAuth` event.
     */
    logout() {
        currentUser = undefined;
        authObservers.map(o => o(undefined));
    },
    /**
     * Add a callback function to be notified when Auth events
     * take place.
     *
     * @param observer callback function for `onAuth` events
     */
    addAuthObserver(observer) {
        authObservers.push(observer);
        observer(currentUser);
    },
    /**
     * Get a list of all the callback observers which have registered
     */
    getAuthObservers() {
        return authObservers;
    }
};
//# sourceMappingURL=authAdmin.js.map