"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const authAdmin_1 = require("./auth/authAdmin");
const authMock_1 = require("./auth/authMock");
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
exports.authApi = Object.assign(Object.assign({}, authMock_1.authMockApi), authAdmin_1.authAdminApi);
//# sourceMappingURL=auth.js.map