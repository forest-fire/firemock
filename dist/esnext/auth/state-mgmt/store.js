import { FireMockError } from "../../errors/FireMockError";
import { clientApiUser } from "../client-sdk/UserObject";
/**
 * The recognized users in the mock Auth system
 */
let _users = [];
/**
 * The `uid` of the user which is currently logged in.
 *
 * > **Note:** this only applies to client-sdk usages
 */
let _currentUser;
/** the full `UserCredential` object for the current user */
let _currentUserCredential;
/**
 * callbacks sent in for callback when the
 * _auth_ state changes.
 */
let _authObservers = [];
/**
 * The _providers_ which have been enabled
 * for this mock Auth API
 */
let _providers = [];
export function getAuthObservers() {
    return _authObservers;
}
export function addAuthObserver(ob) {
    _authObservers.push(ob);
}
export function initializeAuth(config) {
    const baseUser = () => ({
        emailVerified: false,
        uid: getRandomMockUid(),
        providerData: []
    });
    _users =
        (config.users || []).map(u => (Object.assign(Object.assign({}, baseUser()), u))) || [];
    _providers = config.providers || [];
}
function isUser(user) {
    return user.uid !== undefined ? true : false;
}
/** sets the current user based on a given `UserCredential` */
export function setCurrentUser(user) {
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
    }
    else {
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
let _defaultAnonymousUid;
export function setDefaultAnonymousUid(uid) {
    _defaultAnonymousUid = uid;
}
export function getAnonymousUid() {
    return _defaultAnonymousUid ? _defaultAnonymousUid : getRandomMockUid();
}
export function addUser(user) {
    const defaultUser = {
        uid: getRandomMockUid(),
        disabled: false,
        emailVerified: false
    };
    const fullUser = Object.assign(Object.assign({}, defaultUser), user);
    if (_users.find(u => u.uid === fullUser.uid)) {
        throw new FireMockError(`Attempt to add user with UID of "${fullUser.uid}" failed as the user already exists!`);
    }
    _users = _users.concat(fullUser);
}
export function getUserById(uid) {
    return _users.find(u => u.uid === uid);
}
export function getUserByEmail(email) {
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
export function convertToFirebaseUser(user) {
    return Object.assign(Object.assign({}, user), clientApiUser);
}
export function updateUser(uid, update) {
    const existing = _users.find(u => u.uid === uid);
    if (!existing) {
        throw new FireMockError(`Attempt to update the user with UID of "${uid}" failed because this user is not defined in the mock Auth instance!`);
    }
    _users = _users.map(u => u.uid === uid ? Object.assign(Object.assign({}, u), update) : u);
}
export function allUsers() {
    return _users;
}
export function removeUser(uid) {
    if (!_users.find(u => u.uid === uid)) {
        throw new FireMockError(`Attempt to remove the user with UID of "${uid}" failed because this user was NOT in the mock Auth instance!`);
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
//# sourceMappingURL=store.js.map