"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../auth");
const authMockHelpers_1 = require("../client-sdk/authMockHelpers");
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
/**
 * primary API for administrating the MOCK state/config
 */
exports.authAdminApi = {
    /**
     * State explicitly what UID an anonymous user
     * should get; if not stated the default is to
     * generate a random UID.
     *
     * **Note:** this is a administrative admin function
     * and _not_ a part of the Firebase API.
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
//# sourceMappingURL=authAdminApi.js.map