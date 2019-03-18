import { networkDelay } from "./util";
import { createError } from "common-types";
let hasConnectedToAuthService = false;
const ANONYMOUS_USER_ID = "123456";
let validEmailLogins = [];
let authConfig = {};
export function configureAuth(config = {
    allowAnonymous: true,
    allowEmailLogins: false,
    allowEmailLinks: false,
    allowPhoneLogins: false
}) {
    authConfig = config;
    validEmailLogins = config.validEmailLogins ? config.validEmailLogins : [];
}
const authApi = {
    signInAnonymously: async () => {
        await networkDelay();
        if (authConfig.allowAnonymous) {
            const user = {
                isAnonymous: true,
                uid: ANONYMOUS_USER_ID,
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
            return credentials;
        }
        else {
            throw createError("auth/operation-not-allowed", "you must enable anonymous auth in the Firebase Console");
        }
    },
    async signInWithEmailAndPassword(email, password) {
        await networkDelay();
        const found = validEmailLogins.find(i => i.email === email);
        return found ? FakeUser(found) : undefined;
    },
    async createUserWithEmailAndPassword(email, password) {
        //
    },
    async sendPasswordReset() {
        //
    },
    async confirmPasswordReset() {
        //
    },
    async signOut() {
        return;
    }
};
const auth = async () => {
    if (hasConnectedToAuthService) {
        return authApi;
    }
    await networkDelay();
    hasConnectedToAuthService = true;
    return authApi;
};
function FakeUser(user) {
    return {
        user: {
            email: user.email,
            uid: Math.random()
                .toString(36)
                .substr(2, 10)
        }
    };
}
export { auth, authApi };
