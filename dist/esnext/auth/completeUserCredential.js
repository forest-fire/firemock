import { authAdminApi } from "./authAdmin";
import merge from "deepmerge";
/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
export function completeUserCredential(partial) {
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
                    authAdminApi.updateEmailUser(partial.user.email, { password });
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
            uid: authAdminApi.getAnonymousUid()
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
    return merge(fakeUserCredential, partial);
}
const fakeApplicationVerifier = {
    async confirm(verificationCode) {
        return completeUserCredential({});
    },
    verificationId: "verification"
};
//# sourceMappingURL=completeUserCredential.js.map