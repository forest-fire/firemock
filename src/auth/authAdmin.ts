import { User } from "../@types/auth-types";
import { IMockAuthConfig } from "../@types/config-types";
import { authApi } from "../auth";

let authConfig: IMockAuthConfig = {
  allowAnonymous: true
};
let ANONYMOUS_USER_ID = "123456";
export type Observer = (user: User | null) => any;
const authObservers: Observer[] = [];

export type IMockAdminApi = typeof authAdminApi;

export const authAdminApi = {
  configureAuth(config: IMockAuthConfig) {
    authConfig = { ...authConfig, ...config };
  },

  getValidEmails() {
    return authConfig.validEmailLogins || [];
  },

  getAuthConfig() {
    return authConfig;
  },

  setAnonymousUser(uid: string) {
    ANONYMOUS_USER_ID = uid;
    return authApi;
  },

  getAnonymousUid() {
    return ANONYMOUS_USER_ID;
  },

  addAuthObserver(observer: (user: User | null) => any) {
    authObservers.push(observer);
  },

  getAuthObservers() {
    return authObservers;
  }
};
