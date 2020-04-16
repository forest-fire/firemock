"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const atRandom_1 = require("../../../shared/atRandom");
const state_mgmt_1 = require("../../state-mgmt");
async function getIdToken() {
    const user = state_mgmt_1.currentUser();
    const userConfig = state_mgmt_1.allUsers().find(i => i.email === user.email);
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