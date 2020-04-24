"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getIdToken_1 = require("./getIdToken");
async function getIdTokenResult(forceRefresh) {
    return {
        authTime: "",
        claims: {},
        expirationTime: "",
        issuedAtTime: "",
        signInProvider: "",
        signInSecondFactor: "",
        token: await getIdToken_1.getIdToken()
    };
}
exports.getIdTokenResult = getIdTokenResult;
//# sourceMappingURL=getIdTokenResult.js.map