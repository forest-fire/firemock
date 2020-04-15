"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireMockError_1 = require("../../errors/FireMockError");
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
/**
 * The _providers_ which have been enabled
 * for this mock Auth API
 */
let _providers = [];
function initializeAuth(config) {
    _users = config.users || [];
    _providers = config.providers || [];
}
exports.initializeAuth = initializeAuth;
function currentUser() {
    return _currentUser ? _users.find(u => u.uid === _currentUser) : undefined;
}
exports.currentUser = currentUser;
function clearAuthUsers() {
    _users = [];
}
exports.clearAuthUsers = clearAuthUsers;
function addUser(user) {
    const defaultUser = {
        uid: `mock-uid-` +
            Math.random()
                .toString(36)
                .substr(2, 10),
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
function updateUser(uid, update) {
    const existing = _users.find(u => u.uid === uid);
    if (!existing) {
        throw new FireMockError_1.FireMockError(`Attempt to update the user with UID of "${uid}" failed because this user is not defined in the mock Auth instance!`);
    }
    _users = _users.map(u => (u.uid === uid ? Object.assign(Object.assign({}, u), update) : u));
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
//# sourceMappingURL=store.js.map