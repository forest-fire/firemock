"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("../../shared");
const completeUserCredential_1 = require("./completeUserCredential");
const FireMockError_1 = require("../../errors/FireMockError");
const authMockHelpers_1 = require("./authMockHelpers");
const state_mgmt_1 = require("../state-mgmt");
const UserObject_1 = require("./UserObject");
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
        state_mgmt_1.addAuthObserver(observer);
    },
    async setPersistence() {
        console.warn(`currently firemock accepts calls to setPersistence() but it doesn't support it.`);
    },
    signInAnonymously: async () => {
        await shared_1.networkDelay();
        if (state_mgmt_1.authProviders().includes("anonymous")) {
            const user = Object.assign(Object.assign({}, UserObject_1.clientApiUser), { isAnonymous: true, uid: state_mgmt_1.getAnonymousUid() });
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
            state_mgmt_1.addUser(userCredential.user);
            state_mgmt_1.setCurrentUser(userCredential);
            return userCredential;
        }
        else {
            throw new FireMockError_1.FireMockError("you must enable anonymous auth in the Firebase Console", "auth/operation-not-allowed");
        }
    },
    async signInWithEmailAndPassword(email, password) {
        await shared_1.networkDelay();
        if (!authMockHelpers_1.emailValidationAllowed()) {
            throw new FireMockError_1.FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (!authMockHelpers_1.emailIsValidFormat(email)) {
            throw new FireMockError_1.FireMockError(`invalid email: ${email}`, "auth/invalid-email");
        }
        const found = state_mgmt_1.allUsers().find(i => i.email === email);
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
        state_mgmt_1.setCurrentUser(u);
        return u;
    },
    /**
     * Add a new user with the Email/Password provider
     */
    async createUserWithEmailAndPassword(email, password) {
        await shared_1.networkDelay();
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
        state_mgmt_1.addUser({ uid: partial.user.uid, email, password });
        state_mgmt_1.setCurrentUser(u);
        return u;
    },
    async confirmPasswordReset(code, newPassword) {
        return;
    },
    async sendPasswordResetEmail(email, actionCodeSetting) {
        return;
    },
    async signOut() {
        state_mgmt_1.clearCurrentUser();
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
//# sourceMappingURL=implemented.js.map