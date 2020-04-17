"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./shared/util");
const implemented_1 = require("./auth/client-sdk/implemented");
let hasConnectedToAuthService = false;
exports.auth = async () => {
    if (hasConnectedToAuthService) {
        return exports.authApi;
    }
    await util_1.networkDelay();
    hasConnectedToAuthService = true;
    return exports.authApi;
};
// tslint:disable-next-line:no-object-literal-type-assertion
exports.authApi = Object.assign({}, implemented_1.implemented);
//# sourceMappingURL=auth.js.map