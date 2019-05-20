"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const authAdmin_1 = require("./authAdmin");
const completeUserCredential_1 = require("./completeUserCredential");
const common_types_1 = require("common-types");
const notImplemented_1 = require("./notImplemented");
const FiremockError_1 = require("../errors/FiremockError");
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
        authAdmin_1.authAdminApi.addAuthObserver(observer);
    },
    signInAnonymously: async () => {
        await util_1.networkDelay();
        const authConfig = authAdmin_1.authAdminApi.getAuthConfig();
        if (authConfig.allowAnonymous) {
            const user = {
                isAnonymous: true,
                uid: authAdmin_1.authAdminApi.getAnonymousUid(),
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
            return completeUserCredential_1.completeUserCredential(credentials);
        }
        else {
            throw common_types_1.createError("auth/operation-not-allowed", "you must enable anonymous auth in the Firebase Console");
        }
    },
    async signInWithEmailAndPassword(email, password) {
        await util_1.networkDelay();
        if (!authMockHelpers_1.emailValidationAllowed()) {
            throw new FiremockError_1.FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (!authMockHelpers_1.checkIfEmailIsValidFormat(email)) {
            throw new FiremockError_1.FireMockError(`invalid email: ${email}`, "auth/invalid-email");
        }
        const found = authAdmin_1.authAdminApi
            .getAuthConfig()
            .validEmailLogins.find(i => i.email === email);
        if (!found) {
            throw common_types_1.createError(`auth/user-not-found`, `The email "${email}" was not found`);
        }
        if (!authMockHelpers_1.validEmailUserPassword(email, found.password)) {
            throw new FiremockError_1.FireMockError(`Invalid password for ${email}`, "auth/wrong-password");
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
        authMockHelpers_1.loggedIn(partial.user);
        return completeUserCredential_1.completeUserCredential(partial);
    },
    async createUserWithEmailAndPassword(email, password) {
        await util_1.networkDelay();
        if (!authMockHelpers_1.emailValidationAllowed()) {
            throw new FiremockError_1.FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (authMockHelpers_1.checkIfEmailUserExists(email)) {
            throw new FiremockError_1.FireMockError(`"${email}" user already exists`, "auth/email-already-in-use");
        }
        if (authMockHelpers_1.checkIfEmailIsValidFormat(email)) {
            throw new FiremockError_1.FireMockError(`"${email}" user already exists`, "auth/invalid-email");
        }
        if (!authMockHelpers_1.validEmailUserPassword(email, password)) {
            throw new FiremockError_1.FireMockError(`invalid password for "${email}" user`, "firemock/denied");
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
        authMockHelpers_1.loggedIn(partial.user);
        return completeUserCredential_1.completeUserCredential(partial);
    },
    async confirmPasswordReset(code, newPassword) {
        return;
    },
    async sendPasswordResetEmail(email, actionCodeSetting) {
        return;
    },
    async signOut() {
        authMockHelpers_1.loggedOut();
        return;
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
exports.authMockApi = Object.assign({}, notImplemented_1.notImplemented, exports.implemented);
//# sourceMappingURL=authMock.js.map