import { networkDelay } from "../util";
import { authAdminApi } from "./authAdmin";
import { completeUserCredential } from "./completeUserCredential";
import { createError } from "common-types";
import { notImplemented } from "./notImplemented";
import { FireMockError } from "../errors/FireMockError";
import { checkIfEmailUserExists, validEmailUserPassword, emailVerified, userUid, emailValidationAllowed, loggedIn, loggedOut, checkIfEmailIsValidFormat } from "./authMockHelpers";
export const implemented = {
    app: {
        name: "mocked-app",
        options: {},
        async delete() {
            return;
        },
        automaticDataCollectionEnabled: false
    },
    onAuthStateChanged(observer) {
        authAdminApi.addAuthObserver(observer);
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
                providerId: "anonymous",
                toJSON: () => "" // recently added
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
        if (!emailValidationAllowed()) {
            throw new FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (!checkIfEmailIsValidFormat(email)) {
            throw new FireMockError(`invalid email: ${email}`, "auth/invalid-email");
        }
        const found = authAdminApi
            .getAuthConfig()
            .validEmailLogins.find(i => i.email === email);
        if (!found) {
            throw createError(`auth/user-not-found`, `The email "${email}" was not found`);
        }
        if (!validEmailUserPassword(email, found.password)) {
            throw new FireMockError(`Invalid password for ${email}`, "auth/wrong-password");
        }
        const partial = {
            user: {
                email: found.email,
                isAnonymous: false,
                emailVerified: emailVerified(email),
                uid: userUid(email)
            },
            credential: {
                signInMethod: "signInWithEmailAndPassword",
                providerId: ""
            },
            additionalUserInfo: {
                username: email
            }
        };
        loggedIn(partial.user);
        return completeUserCredential(partial);
    },
    async createUserWithEmailAndPassword(email, password) {
        await networkDelay();
        if (!emailValidationAllowed()) {
            throw new FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (checkIfEmailUserExists(email)) {
            throw new FireMockError(`"${email}" user already exists`, "auth/email-already-in-use");
        }
        if (checkIfEmailIsValidFormat(email)) {
            throw new FireMockError(`"${email}" user already exists`, "auth/invalid-email");
        }
        if (!validEmailUserPassword(email, password)) {
            throw new FireMockError(`invalid password for "${email}" user`, "firemock/denied");
        }
        const partial = {
            user: {
                email,
                isAnonymous: false,
                emailVerified: false,
                uid: userUid(email)
            },
            credential: {
                signInMethod: "signInWithEmailAndPassword",
                providerId: ""
            },
            additionalUserInfo: {
                username: email
            }
        };
        loggedIn(partial.user);
        return completeUserCredential(partial);
    },
    async confirmPasswordReset(code, newPassword) {
        return;
    },
    async sendPasswordResetEmail(email, actionCodeSetting) {
        return;
    },
    async signOut() {
        loggedOut();
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
// tslint:disable-next-line:no-object-literal-type-assertion
export const authMockApi = Object.assign({}, notImplemented, implemented);
//# sourceMappingURL=authMock.js.map