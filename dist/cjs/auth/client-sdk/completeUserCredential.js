"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deepmerge_1 = __importDefault(require("deepmerge"));
const UserObject_1 = require("./UserObject");
const state_mgmt_1 = require("../state-mgmt");
/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
function completeUserCredential(partial) {
    const fakeUserCredential = {
        user: Object.assign(Object.assign({}, UserObject_1.clientApiUser), { displayName: "", email: "", isAnonymous: true, metadata: {}, phoneNumber: "", photoURL: "", providerData: [], providerId: "", refreshToken: "", uid: state_mgmt_1.getRandomMockUid() }),
        additionalUserInfo: {
            isNewUser: false,
            profile: "",
            providerId: "",
            username: "fake"
        },
        operationType: "",
        credential: {
            signInMethod: "fake",
            providerId: "fake",
            toJSON: () => "" // added recently
        }
    };
    return deepmerge_1.default(fakeUserCredential, partial);
}
exports.completeUserCredential = completeUserCredential;
exports.fakeApplicationVerifier = {
    async confirm(verificationCode) {
        return completeUserCredential({});
    },
    verificationId: "verification"
};
//# sourceMappingURL=completeUserCredential.js.map