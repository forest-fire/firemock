import { authAdminApi } from "./authAdmin";
import { User } from "@firebase/auth-types";
import { validate } from "email-validator";

export function checkIfEmailUserExists(email: string) {
  const emails = authAdminApi.getValidEmails();
  return emails.map(e => e.email).includes(email);
}

export function checkIfEmailIsValidFormat(email: string) {
  return validate(email);
}

export function validEmailUserPassword(email: string, password: string) {
  const config = authAdminApi.getValidEmails().find(i => i.email === email);
  return config ? config.password === password : false;
}

export function emailVerified(email: string) {
  const config = authAdminApi.getValidEmails().find(i => i.email === email);
  return config ? config.verified || false : false;
}

export function userUid(email: string) {
  const config = authAdminApi.getValidEmails().find(i => i.email === email);
  return config.uid || createUid();
}

export function createUid() {
  return Math.random()
    .toString(36)
    .substr(2, 10);
}

export function emailValidationAllowed() {
  return authAdminApi.getAuthConfig().allowEmailLogins;
}

export function loggedIn(user: User) {
  authAdminApi.getAuthObservers().map(o => o(user));
}

export function loggedOut() {
  authAdminApi.getAuthObservers().map(o => o(null));
}
