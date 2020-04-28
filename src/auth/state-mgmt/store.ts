import {
  IMockUser,
  IMockAuthConfig,
  IAuthProviderName,
  ISimplifiedMockUser,
  UpdateRequest
} from "../../@types";
import { pk } from "common-types";
import { FireMockError } from "../../errors/FireMockError";
import { UserCredential, User } from "@firebase/auth-types";
import { clientApiUser } from "../client-sdk/UserObject";

/**
 * The recognized users in the mock Auth system
 */
let _users: IMockUser[] = [];

/**
 * The `uid` of the user which is currently logged in.
 *
 * > **Note:** this only applies to client-sdk usages
 */
let _currentUser: pk;

/** the full `UserCredential` object for the current user */
let _currentUserCredential: UserCredential;

export type IAuthObserver = (user: User | null) => any;
/**
 * callbacks sent in for callback when the
 * _auth_ state changes.
 */
let _authObservers: IAuthObserver[] = [];

/**
 * The _providers_ which have been enabled
 * for this mock Auth API
 */
let _providers: IAuthProviderName[] = [];

export function getAuthObservers() {
  return _authObservers;
}

export function addAuthObserver(ob: IAuthObserver) {
  _authObservers.push(ob);
}

export function initializeAuth(config: IMockAuthConfig) {
  const baseUser: () => Partial<IMockUser> = () => ({
    emailVerified: false,
    uid: getRandomMockUid(),
    providerData: []
  });
  _users =
    (config.users || []).map(u => ({ ...baseUser(), ...u } as IMockUser)) || [];
  _providers = config.providers || [];
}

function isUser(user: User | UserCredential): user is User {
  return (user as User).uid !== undefined ? true : false;
}

/** sets the current user based on a given `UserCredential` */
export function setCurrentUser(user: User | UserCredential) {
  if (isUser(user)) {
    _currentUser = user.uid;
    _currentUserCredential = {
      user,
      additionalUserInfo: {
        isNewUser: false,
        profile: {},
        providerId: "mock",
        username: user.email
      },
      credential: {
        signInMethod: "mock",
        providerId: "mock",
        toJSON: () => user
      }
    };
  } else {
    _currentUser = user.user.uid;
    _currentUserCredential = user;
  }
  // It should notify all auth observers on `setCurrentUser` call method
  getAuthObservers().map(o => o(_currentUserCredential.user));
}

/**
 * Returns the `IMockUser` record for the currently logged in user
 */
export function currentUser() {
  return _currentUser ? _users.find(u => u.uid === _currentUser) : undefined;
}

/**
 * Returns the full `UserCredential` object for the logged in user;
 * this is only relevant for client sdk.
 */
export function currentUserCredential() {
  return _currentUserCredential;
}

/**
 * Clears the `currentUser` and `currentUserCredential` as would be
 * typical of what happens at the point a user is logged out.
 */
export function clearCurrentUser() {
  _currentUser = undefined;
  _currentUserCredential = undefined;
  // It should notify all auth observers on `clearCurrentUser` call method
  getAuthObservers().map(o => o(undefined));
}

/**
 * Clears all known mock users
 */
export function clearAuthUsers() {
  _users = [];
}

/**
 * The _default_ **uid** to assigne to anonymous users
 */
let _defaultAnonymousUid: string;

export function setDefaultAnonymousUid(uid: string) {
  _defaultAnonymousUid = uid;
}

export function getAnonymousUid() {
  return _defaultAnonymousUid ? _defaultAnonymousUid : getRandomMockUid();
}

export function addUser(user: ISimplifiedMockUser | User) {
  const defaultUser: Partial<IMockUser> = {
    uid: getRandomMockUid(),
    disabled: false,
    emailVerified: false
  };
  const fullUser = { ...defaultUser, ...user } as IMockUser;
  if (_users.find(u => u.uid === fullUser.uid)) {
    throw new FireMockError(
      `Attempt to add user with UID of "${fullUser.uid}" failed as the user already exists!`
    );
  }

  _users = _users.concat(fullUser);
}

export function getUserById(uid: string) {
  return _users.find(u => u.uid === uid);
}

export function getUserByEmail(email: string) {
  return _users.find(u => u.email === email);
}

/**
 * Converts the basic properties provided by a
 * `IMockUser` definition into a full fledged `User` object
 * which is a superset including methods such as `updateEmail`,
 * `updatePassword`, etc. For more info refer to docs on `User`:
 *
 * [User Docs](https://firebase.google.com/docs/reference/js/firebase.User)
 *
 * @param user a mock user defined by `IMockUser`
 */
export function convertToFirebaseUser(user: IMockUser): User {
  return {
    ...user,
    ...clientApiUser
  } as User;
}

export function updateUser(
  uid: string,
  update: Partial<IMockUser> | UpdateRequest
) {
  const existing = _users.find(u => u.uid === uid);
  if (!existing) {
    throw new FireMockError(
      `Attempt to update the user with UID of "${uid}" failed because this user is not defined in the mock Auth instance!`
    );
  }
  _users = _users.map(u =>
    u.uid === uid ? ({ ...u, ...update } as IMockUser) : u
  );
}

export function allUsers() {
  return _users;
}

export function removeUser(uid: string) {
  if (!_users.find(u => u.uid === uid)) {
    throw new FireMockError(
      `Attempt to remove the user with UID of "${uid}" failed because this user was NOT in the mock Auth instance!`
    );
  }
  _users = _users.filter(u => u.uid !== uid);
}

export function authProviders() {
  return _providers;
}

export function getRandomMockUid() {
  return `mock-uid-${Math.random()
    .toString(36)
    .substr(2, 10)}`;
}
