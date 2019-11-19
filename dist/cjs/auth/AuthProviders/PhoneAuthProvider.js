"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PhoneAuthProvider_Instance_1 = require("./PhoneAuthProvider_Instance");
class PhoneAuthProvider extends PhoneAuthProvider_Instance_1.PhoneAuthProvider_Instance {
    static credential(verificationId, verificationCode) {
        throw new Error("not implemented");
    }
}
exports.PhoneAuthProvider = PhoneAuthProvider;
//# sourceMappingURL=PhoneAuthProvider.js.map