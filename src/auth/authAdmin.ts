import { IAuthConfig, IEmailLogin } from "./types";
import { authApi } from "../auth";

let validEmailLogins: IEmailLogin[] = [];
let authConfig: IAuthConfig = {};
let ANONYMOUS_USER_ID = "123456";

export type IMockAdminApi = typeof authAdminApi;

export const authAdminApi = {
  configureAuth(config: IAuthConfig) {
    authConfig = config;
    validEmailLogins = config.validEmailLogins ? config.validEmailLogins : [];
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
  }
};
