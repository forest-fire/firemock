import { authAdminApi } from "./authAdmin";
import { validate } from "email-validator";
export function checkIfEmailUserExists(email) {
    const emails = authAdminApi.getValidEmailUsers();
    return emails.map(e => e.email).includes(email);
}
export function checkIfEmailIsValidFormat(email) {
    return validate(email);
}
export function validEmailUserPassword(email, password) {
    const config = authAdminApi.getValidEmailUsers().find(i => i.email === email);
    return config ? config.password === password : false;
}
export function emailVerified(email) {
    const config = authAdminApi.getValidEmailUsers().find(i => i.email === email);
    return config ? config.verified || false : false;
}
export function userUid(email) {
    const config = authAdminApi.getValidEmailUsers().find(i => i.email === email);
    return config.uid || createUid();
}
export function createUid() {
    // example: 0CMjMW6vWQePd3zVmap78mHCxst1
    return Math.random()
        .toString(36)
        .substr(2, 28);
}
export function emailValidationAllowed() {
    return authAdminApi.getAuthConfig().allowEmailLogins;
}
export function loggedIn(user) {
    authAdminApi.getAuthObservers().map(o => o(user));
}
export function loggedOut() {
    authAdminApi.getAuthObservers().map(o => o(null));
}
//# sourceMappingURL=authMockHelpers.js.map