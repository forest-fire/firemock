import { validate } from "email-validator";
import { allUsers, authProviders, getRandomMockUid, getAuthObservers } from "../state-mgmt";
export function emailExistsAsUserInAuth(email) {
    const emails = allUsers().map(i => i.email);
    return emails.includes(email);
}
export function emailIsValidFormat(email) {
    return validate(email);
}
export function emailHasCorrectPassword(email, password) {
    const config = allUsers().find(i => i.email === email);
    return config ? config.password === password : false;
}
export function emailVerified(email) {
    const user = allUsers().find(i => i.email === email);
    return user ? user.emailVerified || false : false;
}
export function userUid(email) {
    const config = allUsers().find(i => i.email === email);
    return config ? config.uid || getRandomMockUid() : getRandomMockUid();
}
export function emailValidationAllowed() {
    return authProviders().includes("emailPassword");
}
export function loggedIn(user) {
    getAuthObservers().map(o => o(user));
}
export function loggedOut() {
    getAuthObservers().map(o => o(null));
}
//# sourceMappingURL=authMockHelpers.js.map