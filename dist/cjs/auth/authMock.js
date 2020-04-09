"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const authAdminApi_1 = require("./authAdminApi");
const completeUserCredential_1 = require("./completeUserCredential");
const notImplemented_1 = require("./notImplemented");
const FireMockError_1 = require("../errors/FireMockError");
const authMockHelpers_1 = require("./authMockHelpers");
exports.implemented = {
    app: {
        name: "mocked-app",
        options: {},
        async delete() {
            return;
        },
        automaticDataCollectionEnabled: false
    },
    onAuthStateChanged(observer) {
        authAdminApi_1.authAdminApi.addAuthObserver(observer);
    },
    async setPersistence() {
        console.warn(`currently firemock accepts calls to setPersistence() but it doesn't support it.`);
    },
    signInAnonymously: async () => {
        await util_1.networkDelay();
        const authConfig = authAdminApi_1.authAdminApi.getAuthConfig();
        if (authConfig.allowAnonymous) {
            const user = {
                isAnonymous: true,
                uid: authAdminApi_1.authAdminApi.getAnonymousUid(),
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
            const userCredential = completeUserCredential_1.completeUserCredential(credentials);
            authAdminApi_1.authAdminApi.login(userCredential.user);
            return userCredential;
        }
        else {
            throw new FireMockError_1.FireMockError("you must enable anonymous auth in the Firebase Console", "auth/operation-not-allowed");
        }
    },
    async signInWithEmailAndPassword(email, password) {
        await util_1.networkDelay();
        if (!authMockHelpers_1.emailValidationAllowed()) {
            throw new FireMockError_1.FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (!authMockHelpers_1.emailIsValidFormat(email)) {
            throw new FireMockError_1.FireMockError(`invalid email: ${email}`, "auth/invalid-email");
        }
        const found = authAdminApi_1.authAdminApi
            .getAuthConfig()
            .validEmailUsers.find(i => i.email === email);
        if (!found) {
            throw new FireMockError_1.FireMockError(`The email "${email}" was not found`, `auth/user-not-found`);
        }
        if (!authMockHelpers_1.emailHasCorrectPassword(email, password)) {
            throw new FireMockError_1.FireMockError(`Invalid password for ${email}`, "auth/wrong-password");
        }
        const partial = {
            user: {
                email: found.email,
                isAnonymous: false,
                emailVerified: authMockHelpers_1.emailVerified(email),
                uid: authMockHelpers_1.userUid(email)
            },
            credential: {
                signInMethod: "signInWithEmailAndPassword",
                providerId: ""
            },
            additionalUserInfo: {
                username: email
            }
        };
        const u = completeUserCredential_1.completeUserCredential(partial);
        authAdminApi_1.authAdminApi.login(u.user);
        return u;
    },
    /**
     * Add a new user with the Email/Password provider
     */
    async createUserWithEmailAndPassword(email, password) {
        await util_1.networkDelay();
        if (!authMockHelpers_1.emailValidationAllowed()) {
            throw new FireMockError_1.FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (authMockHelpers_1.emailExistsAsUserInAuth(email)) {
            throw new FireMockError_1.FireMockError(`"${email}" user already exists`, "auth/email-already-in-use");
        }
        if (!authMockHelpers_1.emailIsValidFormat(email)) {
            throw new FireMockError_1.FireMockError(`"${email}" is not a valid email format`, "auth/invalid-email");
        }
        const partial = {
            user: {
                email,
                isAnonymous: false,
                emailVerified: false,
                uid: authMockHelpers_1.userUid(email)
            },
            credential: {
                signInMethod: "signInWithEmailAndPassword",
                providerId: ""
            },
            additionalUserInfo: {
                username: email
            }
        };
        const u = completeUserCredential_1.completeUserCredential(partial);
        authAdminApi_1.authAdminApi.addUserToAuth(u.user, password);
        authAdminApi_1.authAdminApi.login(u.user);
        return u;
    },
    async confirmPasswordReset(code, newPassword) {
        return;
    },
    async sendPasswordResetEmail(email, actionCodeSetting) {
        return;
    },
    async signOut() {
        authAdminApi_1.authAdminApi.logout();
    },
    get currentUser() {
        return completeUserCredential_1.completeUserCredential({}).user;
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
exports.authMockApi = Object.assign(Object.assign({}, notImplemented_1.notImplemented), exports.implemented);
//# sourceMappingURL=authMock.js.map