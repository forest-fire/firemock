import { authApi } from "../auth";
import { createUid } from "./authMockHelpers";
import { FireMockError } from "../errors/FireMockError";
import { IMockAuthConfig } from "../@types/config-types";
import { User } from "@firebase/auth-types";
import { IEmailUser } from "../@types/auth-types";

/**
 * The **Auth** configuration dictionary
 */
let authConfig: IMockAuthConfig = {
  allowAnonymous: true
};

export function clearAuthUsers() {
  authConfig.validEmailUsers = [];
}

let ANONYMOUS_USER_ID: string;

export type Observer = (user: User | null) => any;
/**
 * callbacks sent in for callback when the
 * _auth_ state changes.
 */
const authObservers: Observer[] = [];

/**
 * The currently logged in user
 */
let currentUser: User;

export type IMockAdminApi = typeof authAdminApi;

export const authAdminApi = {
  /**
   * Updates the Auth configuration
   *
   * @param config the new config parameters passed in
   */
  configureAuth(config: IMockAuthConfig) {
    authConfig = { ...authConfig, ...config };
  },

  getValidEmailUsers() {
    return authConfig.validEmailUsers || [];
  },

  getAuthConfig() {
    return authConfig;
  },

  addUserToAuth(u: User, p: string) {
    authConfig.validEmailUsers.push({
      email: u.email,
      password: p,
      uid: u.uid,
      verified: u.emailVerified
    });
  },

  updateEmailUser(email: string, updates: Partial<IEmailUser>) {
    let found = false;
    authConfig.validEmailUsers = authConfig.validEmailUsers.map(i => {
      if (i.email === email) {
        found = true;
        return { ...i, ...updates };
      }

      return i;
    });

    if (!found) {
      throw new FireMockError(
        `Attempt to update email [${email}] failed because that user was not a known user email!`,
        "auth/not-found"
      );
    }
  },

  /**
   * For an already existing user in the Auth user pool, allows
   * the addition of _custom claims_.
   */
  grantUserCustomClaims(email: string, claims: string[]) {
    authAdminApi.updateEmailUser(email, { claims });
  },

  /**
   * State explicitly what UID an anonymous user
   * should get; if not stated the default is to
   * generate a random UID.
   *
   * **Note:** this is a administrative admin function
   * and _not_ a part of the Firebase API.
   */
  setAnonymousUid(uid: string | null) {
    ANONYMOUS_USER_ID = uid;
    return authApi;
  },

  /**
   * Gets a UID for an anonymous user; this UID will
   * be randomly generated unless it has been set
   * statically with the `setAnonymousUid()` method
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
  login(u: User) {
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
  addAuthObserver(observer: (user: User | null) => any) {
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
