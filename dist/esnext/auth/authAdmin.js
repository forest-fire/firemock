import { authApi } from "../auth";
import { createUid } from "./authMockHelpers";
import { FireMockError } from "../errors/FireMockError";
/**
 * The **Auth** configuration dictionary
 */
let authConfig = {
    allowAnonymous: true
};
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
export const authAdminApi = {
    configureAuth(config) {
        authConfig = Object.assign({}, authConfig, config);
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
                return Object.assign({}, i, updates);
            }
            return i;
        });
        if (!found) {
            throw new FireMockError(`Attempt to update email [${email}] failed because that user was not a known user email!`, "auth/not-found");
        }
    },
    /**
     * For an already existing user in the Auth user pool, allows
     * the addition of _custom claims_.
     */
    grantUserCustomClaims(email, claims) {
        authAdminApi.updateEmailUser(email, { claims });
    },
    /**
     * State explicitly what UID an anonymous user
     * should get; if not stated the default is to
     * generate a random UID.
     */
    setAnonymousUser(uid) {
        ANONYMOUS_USER_ID = uid;
        return authApi;
    },
    /**
     * Gets a UID for an anonymous user; this UID will
     * be randomly generated unless it has been set
     * statically with the `setAnonymousUser()` method
     */
    getAnonymousUid() {
        return ANONYMOUS_USER_ID ? ANONYMOUS_USER_ID : createUid();
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
    },
    /**
     * Get a list of all the callback observers which have registered
     */
    getAuthObservers() {
        return authObservers;
    }
};
//# sourceMappingURL=authAdmin.js.map