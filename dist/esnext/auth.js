import { networkDelay } from "./shared/util";
import { implemented } from "./auth/client-sdk/implemented";
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
export const authApi = Object.assign({}, implemented);
//# sourceMappingURL=auth.js.map