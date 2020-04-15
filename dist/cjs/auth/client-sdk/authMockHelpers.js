"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authAdminApi_1 = require("../state-mgmt/authAdminApi");
const email_validator_1 = require("email-validator");
function emailExistsAsUserInAuth(email) {
    const emails = authAdminApi_1.authAdminApi.getValidEmailUsers().map(i => i.email);
    return emails.includes(email);
}
exports.emailExistsAsUserInAuth = emailExistsAsUserInAuth;
function emailIsValidFormat(email) {
    return email_validator_1.validate(email);
}
exports.emailIsValidFormat = emailIsValidFormat;
function emailHasCorrectPassword(email, password) {
    const config = authAdminApi_1.authAdminApi.getValidEmailUsers().find(i => i.email === email);
    return config ? config.password === password : false;
}
exports.emailHasCorrectPassword = emailHasCorrectPassword;
function emailVerified(email) {
    const config = authAdminApi_1.authAdminApi.getValidEmailUsers().find(i => i.email === email);
    return config ? config.verified || false : false;
}
exports.emailVerified = emailVerified;
function userUid(email) {
    const config = authAdminApi_1.authAdminApi.getValidEmailUsers().find(i => i.email === email);
    return config ? config.uid || createUid() : createUid();
}
exports.userUid = userUid;
function createUid() {
    // example: 0CMjMW6vWQePd3zVmap78mHCxst1
    return Math.random()
        .toString(36)
        .substr(2, 28);
}
exports.createUid = createUid;
function emailValidationAllowed() {
    return authAdminApi_1.authAdminApi.getAuthConfig().allowEmailLogins;
}
exports.emailValidationAllowed = emailValidationAllowed;
function loggedIn(user) {
    authAdminApi_1.authAdminApi.getAuthObservers().map(o => o(user));
}
exports.loggedIn = loggedIn;
function loggedOut() {
    authAdminApi_1.authAdminApi.getAuthObservers().map(o => o(null));
}
exports.loggedOut = loggedOut;
//# sourceMappingURL=authMockHelpers.js.map