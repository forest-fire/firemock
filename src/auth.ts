import { networkDelay } from "./util";
import { IMockAuth } from "./@types/auth-types";
import { authAdminApi } from "./auth/state-mgmt/authAdminApi";
import { authMockApi } from "./auth/client-sdk/authMock";

let hasConnectedToAuthService: boolean = false;

export const auth = async (): Promise<typeof authApi> => {
  if (hasConnectedToAuthService) {
    return authApi;
  }

  await networkDelay();

  hasConnectedToAuthService = true;
  return authApi;
};

// tslint:disable-next-line:no-object-literal-type-assertion
export const authApi = {
  ...authMockApi,
  ...authAdminApi
} as IMockAuth;
