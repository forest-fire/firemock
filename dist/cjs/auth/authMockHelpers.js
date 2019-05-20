"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authAdmin_1 = require("./authAdmin");
const email_validator_1 = require("email-validator");
function checkIfEmailUserExists(email) {
    const emails = authAdmin_1.authAdminApi.getValidEmails();
    return emails.map(e => e.email).includes(email);
}
exports.checkIfEmailUserExists = checkIfEmailUserExists;
function checkIfEmailIsValidFormat(email) {
    return email_validator_1.validate(email);
}
exports.checkIfEmailIsValidFormat = checkIfEmailIsValidFormat;
function validEmailUserPassword(email, password) {
    const config = authAdmin_1.authAdminApi.getValidEmails().find(i => i.email === email);
    return config ? config.password === password : false;
}
exports.validEmailUserPassword = validEmailUserPassword;
function emailVerified(email) {
    const config = authAdmin_1.authAdminApi.getValidEmails().find(i => i.email === email);
    return config ? config.verified || false : false;
}
exports.emailVerified = emailVerified;
function userUid(email) {
    const config = authAdmin_1.authAdminApi.getValidEmails().find(i => i.email === email);
    return config.uid || createUid();
}
exports.userUid = userUid;
function createUid() {
    return Math.random()
        .toString(36)
        .substr(2, 10);
}
exports.createUid = createUid;
function emailValidationAllowed() {
    return authAdmin_1.authAdminApi.getAuthConfig().allowEmailLogins;
}
exports.emailValidationAllowed = emailValidationAllowed;
function loggedIn(user) {
    authAdmin_1.authAdminApi.getAuthObservers().map(o => o(user));
}
exports.loggedIn = loggedIn;
function loggedOut() {
    authAdmin_1.authAdminApi.getAuthObservers().map(o => o(null));
}
exports.loggedOut = loggedOut;
//# sourceMappingURL=authMockHelpers.js.map