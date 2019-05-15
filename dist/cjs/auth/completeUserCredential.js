"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authAdmin_1 = require("./authAdmin");
/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
function completeUserCredential(partial) {
    const combined = Object.assign({}, fakeUserCredential, partial);
    return combined;
}
exports.completeUserCredential = completeUserCredential;
const fakeUserCredential = {
    user: {
        async delete() {
            return;
        },
        emailVerified: false,
        async getIdTokenResult() {
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
            return "abc";
        },
        async linkAndRetrieveDataWithCredential(credential) {
            return completeUserCredential({});
        },
        // async linkWithCredential(credential: AuthCredential) {
        //   return completeUserCredential({}).user;
        // },
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
        async updatePassword(newPassword) {
            return;
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
const fakeApplicationVerifier = {
    async confirm(verificationCode) {
        return completeUserCredential({});
    },
    verificationId: "verification"
};
//# sourceMappingURL=completeUserCredential.js.map