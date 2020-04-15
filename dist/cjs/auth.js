"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const authAdminApi_1 = require("./auth/state-mgmt/authAdminApi");
const authMock_1 = require("./auth/client-sdk/authMock");
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
exports.authApi = Object.assign(Object.assign({}, authMock_1.authMockApi), authAdminApi_1.authAdminApi);
//# sourceMappingURL=auth.js.map