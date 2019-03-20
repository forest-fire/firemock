import { networkDelay } from "./util";
import { authAdminApi } from "./auth/authAdmin";
import { authMockApi } from "./auth/authMock";
let hasConnectedToAuthService = false;
export const auth = async () => {
    if (hasConnectedToAuthService) {
        return authApi;
    }
    await networkDelay();
    hasConnectedToAuthService = true;
    return authApi;
};
// tslint:disable-next-line:no-object-literal-type-assertion
export const authApi = Object.assign({}, authMockApi, authAdminApi);
