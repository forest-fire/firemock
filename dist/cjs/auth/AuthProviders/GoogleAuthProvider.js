"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GoogleAuthProvider_Instance_1 = require("./GoogleAuthProvider_Instance");
class GoogleAuthProvider extends GoogleAuthProvider_Instance_1.GoogleAuthProvider_Instance {
    static credential(idToken, accessToken) {
        throw new Error("not implemented");
    }
}
exports.GoogleAuthProvider = GoogleAuthProvider;
//# sourceMappingURL=GoogleAuthProvider.js.map