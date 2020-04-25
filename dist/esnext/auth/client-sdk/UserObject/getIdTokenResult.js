import { getIdToken } from "./getIdToken";
export async function getIdTokenResult(forceRefresh) {
    return {
        authTime: "",
        claims: {},
        expirationTime: "",
        issuedAtTime: "",
        signInProvider: "",
        signInSecondFactor: "",
        token: await getIdToken()
    };
}
//# sourceMappingURL=getIdTokenResult.js.map