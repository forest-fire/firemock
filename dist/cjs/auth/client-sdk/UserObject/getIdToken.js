"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authAdminApi_1 = require("../../state-mgmt/authAdminApi");
const atRandom_1 = require("../../../shared/atRandom");
async function getIdToken() {
    const user = authAdminApi_1.authAdminApi.getCurrentUser();
    const userConfig = authAdminApi_1.authAdminApi
        .getAuthConfig()
        .validEmailUsers.find(i => i.email === user.email);
    if (!user) {
        throw new Error("not logged in");
    }
    if (userConfig.tokenIds) {
        return atRandom_1.atRandom(userConfig.tokenIds);
    }
    else {
        return Math.random()
            .toString(36)
            .substr(2, 10);
    }
}
exports.getIdToken = getIdToken;
//# sourceMappingURL=getIdToken.js.map