import { networkDelay } from "./util";
import { IMockAuth } from "./auth/types";
import { authAdminApi } from "./auth/authAdmin";
import { authMockApi } from "./auth/authMock";

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
