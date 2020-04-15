import { IMockUser, IMockAuthConfig, IAuthProvider } from "../../@types";
import { pk } from "common-types";
import { atRandom } from "../../shared/atRandom";
import { FireMockError } from "../../errors/FireMockError";
import { networkDelay } from "../../util";

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

/**
 * The _providers_ which have been enabled
 * for this mock Auth API
 */
let _providers: IAuthProvider[] = [];

export function initializeAuth(config: IMockAuthConfig) {
  _users = config.users || [];
  _providers = config.providers || [];
}

export function currentUser() {
  return _currentUser ? _users.find(u => u.uid === _currentUser) : undefined;
}

export function addUser(user: Partial<IMockUser>) {
  const defaultUser: Partial<IMockUser> = {
    uid:
      `mock-uid-` +
      Math.random()
        .toString(36)
        .substr(2, 10),
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

export function updateUser(uid: string, update: Partial<IMockUser>) {
  const existing = _users.find(u => u.uid === uid);
  if (!existing) {
    throw new FireMockError(
      `Attempt to update the user with UID of "${uid}" failed because this user is not defined in the mock Auth instance!`
    );
  }
  _users = _users.map(u => (u.uid === uid ? { ...u, ...update } : u));
}

export function removeUser(uid: string) {
  if (!_users.find(u => u.uid === uid)) {
    throw new FireMockError(
      `Attempt to remove the user with UID of "${uid}" failed because this user was NOT in the mock Auth instance!`
    );
  }
  _users = _users.filter(u => u.uid !== uid);
}
