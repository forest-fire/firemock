export class OAuthProvider {
    // tslint:disable-next-line: no-empty
    constructor(providerId) { }
    addScope(scope) {
        throw new Error("not implemented");
    }
    credential(idToken, accessToken) {
        throw new Error("not implemented");
    }
    // tslint:disable-next-line: ban-types
    setCustomParameters(customOAuthParameters) {
        throw new Error("not implemented");
    }
}
//# sourceMappingURL=OAuthProvider.js.map