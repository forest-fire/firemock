import { updateUser } from "../../state-mgmt";
export const claims = {
    /**
     * Sets additional developer claims on an existing user identified by the provided uid,
     * typically used to define user roles and levels of access.
     */
    async setCustomUserClaims(uid, customUserClaims) {
        updateUser(uid, { customClaims: customUserClaims });
    }
};
//# sourceMappingURL=claims.js.map