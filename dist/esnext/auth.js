import { networkDelay } from "./util";
import { authAdminApi } from "./auth/authAdmin";
import { authMockApi } from "./auth/authMock";
// tslint:disable:no-implicit-dependencies
let hasConnectedToAuthService = false;
export const auth = async () => {
    if (hasConnectedToAuthService) {
        return authApi;
    }
    await networkDelay();
    hasConnectedToAuthService = true;
    return authApi;
};
export const authApi = Object.assign({}, authMockApi, authAdminApi);
