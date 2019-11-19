"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GithubAuthProvider_Instance_1 = require("./GithubAuthProvider_Instance");
class GithubAuthProvider extends GithubAuthProvider_Instance_1.GithubAuthProvider_Instance {
    static credential(idToken, accessToken) {
        throw new Error("not implemented");
    }
}
exports.GithubAuthProvider = GithubAuthProvider;
//# sourceMappingURL=GithubAuthProvider.js.map