"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authAdmin_1 = require("./authAdmin");
const deepmerge_1 = __importDefault(require("deepmerge"));
const atRandom_1 = require("../shared/atRandom");
/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
function completeUserCredential(partial) {
    const fakeUserCredential = {
        user: {
            tenantId: "fake-tenantId",
            async delete() {
                return;
            },
            emailVerified: false,
            async getIdTokenResult() {
                const user = authAdmin_1.authAdminApi
                    .getValidEmailUsers()
                    .find(i => i.uid === partial.user.uid);
                const token = user && user.tokenIds ? atRandom_1.atRandom(user.tokenIds) : "random-token";
                return {
                    token: "abc",
                    expirationTime: "format?",
                    authTime: "format?",
                    issuedAtTime: "format?",
                    signInProvider: "fake",
                    claims: {
                        foobar: "abc"
                    }
                };
            },
            async getIdToken() {
                const user = authAdmin_1.authAdminApi.getCurrentUser();
                const userConfig = authAdmin_1.authAdminApi
                    .getAuthConfig()
                    .validEmailUsers.find(i => i.email === user.email);
                if (!user) {
                    throw new Error("not logged in");
                }
                if (userConfig.tokenIds) {
                    return atRandom_1.atRandom(userConfig.tokenIds);
                }
                else {
                    return Math.random()
                        .toString(36)
                        .substr(2, 10);
                }
            },
            async linkAndRetrieveDataWithCredential(credential) {
                return completeUserCredential({});
            },
            async linkWithCredential(credential) {
                return completeUserCredential({});
            },
            async linkWithPhoneNumber(phoneNUmber, applicationVerificer) {
                return fakeApplicationVerifier;
            },
            async linkWithPopup(provider) {
                return completeUserCredential({});
            },
            async linkWithRedirect(provider) {
                return;
            },
            async reauthenticateAndRetrieveDataWithCredential(credential) {
                return completeUserCredential({});
            },
            // async reauthenticateWithCredential(credential: AuthCredential) {
            //   return;
            // },
            async reauthenticateWithCredential(credential) {
                return completeUserCredential({});
            },
            async reauthenticateWithPhoneNumber(phoneNumber, applicationVerifier) {
                return fakeApplicationVerifier;
            },
            async reauthenticateWithPopup(provider) {
                return completeUserCredential({});
            },
            async reauthenticateWithRedirect(provider) {
                return;
            },
            async reload() {
                return;
            },
            async sendEmailVerification(actionCodeSettings) {
                return;
            },
            toJSON() {
                return {};
            },
            async unlink(provider) {
                return completeUserCredential({}).user;
            },
            async updateEmail(newEmail) {
                return;
            },
            updatePassword: async (password) => {
                if (partial.user.email) {
                    authAdmin_1.authAdminApi.updateEmailUser(partial.user.email, { password });
                }
            },
            async updatePhoneNumber(phoneCredential) {
                return;
            },
            async updateProfile(profile) {
                return;
            },
            displayName: "",
            email: "",
            isAnonymous: true,
            metadata: {},
            phoneNumber: "",
            photoURL: "",
            providerData: [],
            providerId: "",
            refreshToken: "",
            uid: authAdmin_1.authAdminApi.getAnonymousUid()
        },
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
const fakeApplicationVerifier = {
    async confirm(verificationCode) {
        return completeUserCredential({});
    },
    verificationId: "verification"
};
//# sourceMappingURL=completeUserCredential.js.map