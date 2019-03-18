import { networkDelay } from "./util";
import { createError } from "common-types";
import { completeUserCredential } from "./auth/completeUserCredential";
import { IEmailLogin, IAuthConfig, IMockAuth } from "./auth/types";
import { FirebaseAuth, UserCredential, User, AuthCredential } from "@firebase/auth-types";
import { authAdminApi } from "./auth/authAdmin";
import { authMockApi } from "./auth/authMock";
// tslint:disable:no-implicit-dependencies

let hasConnectedToAuthService: boolean = false;

const auth = async (): Promise<typeof authApi> => {
  if (hasConnectedToAuthService) {
    return authApi;
  }

  await networkDelay();
  hasConnectedToAuthService = true;
  return authApi;
};

export const authApi: IMockAuth = {
  ...authMockApi,
  ...authAdminApi
};
