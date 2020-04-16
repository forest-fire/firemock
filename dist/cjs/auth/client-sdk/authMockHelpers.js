"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const email_validator_1 = require("email-validator");
const state_mgmt_1 = require("../state-mgmt");
function emailExistsAsUserInAuth(email) {
    const emails = state_mgmt_1.allUsers().map(i => i.email);
    return emails.includes(email);
}
exports.emailExistsAsUserInAuth = emailExistsAsUserInAuth;
function emailIsValidFormat(email) {
    return email_validator_1.validate(email);
}
exports.emailIsValidFormat = emailIsValidFormat;
function emailHasCorrectPassword(email, password) {
    const config = state_mgmt_1.allUsers().find(i => i.email === email);
    return config ? config.password === password : false;
}
exports.emailHasCorrectPassword = emailHasCorrectPassword;
function emailVerified(email) {
    const user = state_mgmt_1.allUsers().find(i => i.email === email);
    return user ? user.emailVerified || false : false;
}
exports.emailVerified = emailVerified;
function userUid(email) {
    const config = state_mgmt_1.allUsers().find(i => i.email === email);
    return config ? config.uid || state_mgmt_1.getRandomMockUid() : state_mgmt_1.getRandomMockUid();
}
exports.userUid = userUid;
function emailValidationAllowed() {
    return state_mgmt_1.authProviders().includes("emailPassword");
}
exports.emailValidationAllowed = emailValidationAllowed;
function loggedIn(user) {
    state_mgmt_1.getAuthObservers().map(o => o(user));
}
exports.loggedIn = loggedIn;
function loggedOut() {
    state_mgmt_1.getAuthObservers().map(o => o(null));
}
exports.loggedOut = loggedOut;
//# sourceMappingURL=authMockHelpers.js.map