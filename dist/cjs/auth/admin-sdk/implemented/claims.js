"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_mgmt_1 = require("../../state-mgmt");
exports.claims = {
    /**
     * Sets additional developer claims on an existing user identified by the provided uid,
     * typically used to define user roles and levels of access.
     */
    async setCustomUserClaims(uid, customUserClaims) {
        state_mgmt_1.updateUser(uid, { customClaims: customUserClaims });
    }
};
//# sourceMappingURL=claims.js.map