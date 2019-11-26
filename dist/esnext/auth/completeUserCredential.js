import { authAdminApi } from "./authAdmin";
import merge from "deepmerge";
import { atRandom } from "../shared/atRandom";
/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
export function completeUserCredential(partial) {
    const fakeUserCredential = {
        user: {
            tenantId: "fake-tenantId",
            async delete() {
                return;
            },
            emailVerified: false,
            async getIdTokenResult() {
                const user = partial.user && partial.user.uid
                    ? authAdminApi
                        .getValidEmailUsers()
                        .find(i => i.uid === partial.user.uid)
                    : undefined;
                const token = user && user.tokenIds ? atRandom(user.tokenIds) : "random-token";
                const claims = user && user.claims ? user.claims : {};
                return {
                    token,
                    expirationTime: "format?",
                    authTime: "format?",
                    issuedAtTime: "format?",
                    signInProvider: "fake",
                    claims
                };
            },
            async getIdToken() {
                const user = authAdminApi.getCurrentUser();
                const userConfig = authAdminApi
                    .getAuthConfig()
                    .validEmailUsers.find(i => i.email === user.email);
                if (!user) {
                    throw new Error("not logged in");
                }
                if (userConfig.tokenIds) {
                    return atRandom(userConfig.tokenIds);
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