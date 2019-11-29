import { networkDelay } from "../util";
import { authAdminApi } from "./authAdmin";
import { completeUserCredential } from "./completeUserCredential";
import { notImplemented } from "./notImplemented";
import { FireMockError } from "../errors/FireMockError";
import { emailExistsAsUserInAuth, emailHasCorrectPassword, emailVerified, userUid, emailValidationAllowed, emailIsValidFormat } from "./authMockHelpers";
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
    async setPersistence() {
        console.warn(`currently firemock accepts calls to setPersistence() but it doesn't support it.`);
    },
    signInAnonymously: async () => {
        await networkDelay();
        const authConfig = authAdminApi.getAuthConfig();
        if (authConfig.allowAnonymous) {
            const user = {
                isAnonymous: true,
                uid: authAdminApi.getAnonymousUid(),
                emailVerified: false,
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
            const userCredential = completeUserCredential(credentials);
            authAdminApi.login(userCredential.user);
            return userCredential;
        }
        else {
            throw new FireMockError("you must enable anonymous auth in the Firebase Console", "auth/operation-not-allowed");
        }
    },
    async signInWithEmailAndPassword(email, password) {
        await networkDelay();
        if (!emailValidationAllowed()) {
            throw new FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (!emailIsValidFormat(email)) {
            throw new FireMockError(`invalid email: ${email}`, "auth/invalid-email");
        }
        const found = authAdminApi
            .getAuthConfig()
            .validEmailUsers.find(i => i.email === email);
        if (!found) {
            throw new FireMockError(`The email "${email}" was not found`, `auth/user-not-found`);
        }
        if (!emailHasCorrectPassword(email, password)) {
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
        const u = completeUserCredential(partial);
        authAdminApi.login(u.user);
        return u;
    },
    /**
     * Add a new user with the Email/Password provider
     */
    async createUserWithEmailAndPassword(email, password) {
        await networkDelay();
        if (!emailValidationAllowed()) {
            throw new FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (emailExistsAsUserInAuth(email)) {
            throw new FireMockError(`"${email}" user already exists`, "auth/email-already-in-use");
        }
        if (!emailIsValidFormat(email)) {
            throw new FireMockError(`"${email}" is not a valid email format`, "auth/invalid-email");
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
        const u = completeUserCredential(partial);
        authAdminApi.addUserToAuth(u.user, password);
        authAdminApi.login(u.user);
        return u;
    },
    async confirmPasswordReset(code, newPassword) {
        return;
    },
    async sendPasswordResetEmail(email, actionCodeSetting) {
        return;
    },
    async signOut() {
        authAdminApi.logout();
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
export const authMockApi = Object.assign(Object.assign({}, notImplemented), implemented);
//# sourceMappingURL=authMock.js.map