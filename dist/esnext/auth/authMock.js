import { networkDelay } from "../util";
import { authAdminApi } from "./authAdmin";
import { completeUserCredential } from "./completeUserCredential";
import { createError } from "common-types";
import { notImplemented } from "./notImplemented";
export const implemented = {
    app: {
        name: "mocked-app",
        options: {},
        async delete() {
            return;
        },
        automaticDataCollectionEnabled: false
    },
    signInAnonymously: async () => {
        await networkDelay();
        const authConfig = authAdminApi.getAuthConfig();
        if (authConfig.allowAnonymous) {
            const user = {
                isAnonymous: true,
                uid: authAdminApi.getAnonymousUid(),
                emailVerified: true,
                phoneNumber: ""
            };
            const credential = {
                signInMethod: "anonymous",
                providerId: "anonymous"
            };
            const credentials = {
                user,
                credential
            };
            return completeUserCredential(credentials);
        }
        else {
            throw createError("auth/operation-not-allowed", "you must enable anonymous auth in the Firebase Console");
        }
    },
    async signInWithEmailAndPassword(email, password) {
        await networkDelay();
        const found = authAdminApi
            .getAuthConfig()
            .validEmailLogins.find(i => i.email === email);
        if (!found) {
            throw createError(`auth/invalid-email`, `The email provided "${email}" is not a valid email in mocked auth module. If you think it should be, make sure you set it with configureAuth() or setValidEmails()`);
        }
        const partial = {
            user: {
                email: found.email,
                isAnonymous: false
            },
            credential: {
                signInMethod: "signInWithEmailAndPassword",
                providerId: ""
            }
        };
        return completeUserCredential(partial);
    },
    async createUserWithEmailAndPassword(email, password) {
        await networkDelay();
        const partial = {
            user: {
                email,
                isAnonymous: false
            },
            credential: {
                signInMethod: "signInWithEmailAndPassword",
                providerId: ""
            }
        };
        return completeUserCredential(partial);
    },
    async confirmPasswordReset(code, newPassword) {
        return;
    },
    async sendPasswordResetEmail(email, actionCodeSetting) {
        return;
    },
    async signOut() {
        return;
    },
    get currentUser() {
        return completeUserCredential({}).user;
    },
    languageCode: "",
    async updateCurrentUser() {
        return;
    },
    settings: {
        appVerificationDisabledForTesting: false
    }
};
export const authMockApi = Object.assign({}, notImplemented, implemented);
