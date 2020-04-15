"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokens = {
    /**
     * Verifies a Firebase ID token (JWT). If the token is valid, the promise is fulfilled
     * with the token's decoded claims; otherwise, the promise is rejected. An optional
     * flag can be passed to additionally check whether the ID token was revoked.
     *
     * @param idToken The ID token to verify
     * @param checkRevoked Whether to check if the ID token was revoked. This requires an
     * extra request to the Firebase Auth backend to check the tokensValidAfterTime time
     * for the corresponding user. When not specified, this additional check is not applied.
     */
    async verifyIdToken(idToken, checkRevoked) {
        return;
    }
};
//# sourceMappingURL=tokens.js.map