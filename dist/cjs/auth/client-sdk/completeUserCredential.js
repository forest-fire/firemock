"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authAdminApi_1 = require("../state-mgmt/authAdminApi");
const deepmerge_1 = __importDefault(require("deepmerge"));
const atRandom_1 = require("../../shared/atRandom");
const UserObject_1 = require("./UserObject");
/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
function completeUserCredential(partial) {
    const fakeUserCredential = {
        user: {
            verifyBeforeUpdateEmail: (newEmail, actionCodeSettings) => {
                return Promise.resolve();
            },
            multiFactor: {
                enroll: (assertion, displayName) => {
                    return Promise.resolve();
                },
                enrolledFactors: [],
                getSession: () => {
                    return Promise.resolve({});
                },
                unenroll: option => {
                    return Promise.resolve();
                }
            },
            tenantId: "fake-tenantId",
            async delete() {
                return;
            },
            emailVerified: false,
            async getIdTokenResult() {
                const user = partial.user && partial.user.uid
                    ? authAdminApi_1.authAdminApi
                        .getValidEmailUsers()
                        .find(i => i.uid === partial.user.uid)
                    : undefined;
                const token = user && user.tokenIds ? atRandom_1.atRandom(user.tokenIds) : "random-token";
                const claims = user && user.claims ? user.claims : {};
                return {
                    token,
                    expirationTime: "format?",
                    authTime: "format?",
                    issuedAtTime: "format?",
                    signInProvider: "fake",
                    signInSecondFactor: "fake-2nd-factor",
                    claims
                };
            },
            updateEmail: UserObject_1.updateEmail,
            updatePassword: UserObject_1.updatePassword,
            getIdToken: UserObject_1.getIdToken,
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
            uid: authAdminApi_1.authAdminApi.getAnonymousUid()
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