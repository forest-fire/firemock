import { authAdminApi } from "../state-mgmt/authAdminApi";
import { User } from "@firebase/auth-types";
import { validate } from "email-validator";
import { allUsers, authProviders } from "../state-mgmt";

export function emailExistsAsUserInAuth(email: string) {
  const emails = allUsers().map(i => i.email);

  return emails.includes(email);
}

export function emailIsValidFormat(email: string) {
  return validate(email);
}

export function emailHasCorrectPassword(email: string, password: string) {
  const config = allUsers().find(i => i.email === email);

  return config ? config.password === password : false;
}

export function emailVerified(email: string) {
  const user = allUsers().find(i => i.email === email);
  return user ? user.emailVerified || false : false;
}

export function userUid(email: string) {
  const config = allUsers().find(i => i.email === email);

  return config ? config.uid || createUid() : createUid();
}

export function createUid() {
  // example: 0CMjMW6vWQePd3zVmap78mHCxst1
  return Math.random()
    .toString(36)
    .substr(2, 28);
}

export function emailValidationAllowed() {
  return authProviders().includes("emailPassword");
}

export function loggedIn(user: User) {
  authAdminApi.getAuthObservers().map(o => o(user));
}

export function loggedOut() {
  authAdminApi.getAuthObservers().map(o => o(null));
}
