"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TwitterAuthProvider_Instance_1 = require("./TwitterAuthProvider_Instance");
class TwitterAuthProvider extends TwitterAuthProvider_Instance_1.TwitterAuthProvider_Instance {
    static credential(idToken, accessToken) {
        throw new Error("not implemented");
    }
}
exports.TwitterAuthProvider = TwitterAuthProvider;
//# sourceMappingURL=TwitterAuthProvider.js.map