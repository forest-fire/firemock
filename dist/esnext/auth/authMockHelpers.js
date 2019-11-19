import { authAdminApi } from "./authAdmin";
import { validate } from "email-validator";
export function emailExistsAsUserInAuth(email) {
    const emails = authAdminApi.getValidEmailUsers().map(i => i.email);
    return emails.includes(email);
}
export function emailIsValidFormat(email) {
    return validate(email);
}
export function emailHasCorrectPassword(email, password) {
    const config = authAdminApi.getValidEmailUsers().find(i => i.email === email);
    console.log("compare", config.password, password);
    return config ? config.password === password : false;
}
export function emailVerified(email) {
    const config = authAdminApi.getValidEmailUsers().find(i => i.email === email);
    return config ? config.verified || false : false;
}
export function userUid(email) {
    const config = authAdminApi.getValidEmailUsers().find(i => i.email === email);
    return config ? config.uid || createUid() : createUid();
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