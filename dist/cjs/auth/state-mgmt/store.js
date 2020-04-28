"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireMockError_1 = require("../../errors/FireMockError");
const UserObject_1 = require("../client-sdk/UserObject");
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
function getAuthObservers() {
    return _authObservers;
}
exports.getAuthObservers = getAuthObservers;
function addAuthObserver(ob) {
    _authObservers.push(ob);
}
exports.addAuthObserver = addAuthObserver;
function initializeAuth(config) {
    const baseUser = () => ({
        emailVerified: false,
        uid: getRandomMockUid(),
        providerData: []
    });
    _users =
        (config.users || []).map(u => (Object.assign(Object.assign({}, baseUser()), u))) || [];
    _providers = config.providers || [];
}
exports.initializeAuth = initializeAuth;
function isUser(user) {
    return user.uid !== undefined ? true : false;
}
/** sets the current user based on a given `UserCredential` */
function setCurrentUser(user) {
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
exports.setCurrentUser = setCurrentUser;
/**
 * Returns the `IMockUser` record for the currently logged in user
 */
function currentUser() {
    return _currentUser ? _users.find(u => u.uid === _currentUser) : undefined;
}
exports.currentUser = currentUser;
/**
 * Returns the full `UserCredential` object for the logged in user;
 * this is only relevant for client sdk.
 */
function currentUserCredential() {
    return _currentUserCredential;
}
exports.currentUserCredential = currentUserCredential;
/**
 * Clears the `currentUser` and `currentUserCredential` as would be
 * typical of what happens at the point a user is logged out.
 */
function clearCurrentUser() {
    _currentUser = undefined;
    _currentUserCredential = undefined;
    // It should notify all auth observers on `clearCurrentUser` call method
    getAuthObservers().map(o => o(undefined));
}
exports.clearCurrentUser = clearCurrentUser;
/**
 * Clears all known mock users
 */
function clearAuthUsers() {
    _users = [];
}
exports.clearAuthUsers = clearAuthUsers;
/**
 * The _default_ **uid** to assigne to anonymous users
 */
let _defaultAnonymousUid;
function setDefaultAnonymousUid(uid) {
    _defaultAnonymousUid = uid;
}
exports.setDefaultAnonymousUid = setDefaultAnonymousUid;
function getAnonymousUid() {
    return _defaultAnonymousUid ? _defaultAnonymousUid : getRandomMockUid();
}
exports.getAnonymousUid = getAnonymousUid;
function addUser(user) {
    const defaultUser = {
        uid: getRandomMockUid(),
        disabled: false,
        emailVerified: false
    };
    const fullUser = Object.assign(Object.assign({}, defaultUser), user);
    if (_users.find(u => u.uid === fullUser.uid)) {
        throw new FireMockError_1.FireMockError(`Attempt to add user with UID of "${fullUser.uid}" failed as the user already exists!`);
    }
    _users = _users.concat(fullUser);
}
exports.addUser = addUser;
function getUserById(uid) {
    return _users.find(u => u.uid === uid);
}
exports.getUserById = getUserById;
function getUserByEmail(email) {
    return _users.find(u => u.email === email);
}
exports.getUserByEmail = getUserByEmail;
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
function convertToFirebaseUser(user) {
    return Object.assign(Object.assign({}, user), UserObject_1.clientApiUser);
}
exports.convertToFirebaseUser = convertToFirebaseUser;
function updateUser(uid, update) {
    const existing = _users.find(u => u.uid === uid);
    if (!existing) {
        throw new FireMockError_1.FireMockError(`Attempt to update the user with UID of "${uid}" failed because this user is not defined in the mock Auth instance!`);
    }
    _users = _users.map(u => u.uid === uid ? Object.assign(Object.assign({}, u), update) : u);
}
exports.updateUser = updateUser;
function allUsers() {
    return _users;
}
exports.allUsers = allUsers;
function removeUser(uid) {
    if (!_users.find(u => u.uid === uid)) {
        throw new FireMockError_1.FireMockError(`Attempt to remove the user with UID of "${uid}" failed because this user was NOT in the mock Auth instance!`);
    }
    _users = _users.filter(u => u.uid !== uid);
}
exports.removeUser = removeUser;
function authProviders() {
    return _providers;
}
exports.authProviders = authProviders;
function getRandomMockUid() {
    return `mock-uid-${Math.random()
        .toString(36)
        .substr(2, 10)}`;
}
exports.getRandomMockUid = getRandomMockUid;
//# sourceMappingURL=store.js.map