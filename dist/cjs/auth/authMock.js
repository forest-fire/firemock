"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const authAdmin_1 = require("./authAdmin");
const completeUserCredential_1 = require("./completeUserCredential");
const common_types_1 = require("common-types");
const notImplemented_1 = require("./notImplemented");
exports.implemented = {
    app: {
        name: "mocked-app",
        options: {},
        async delete() {
            return;
        },
        automaticDataCollectionEnabled: false
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
                providerId: "anonymous"
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
        const found = authAdmin_1.authAdminApi
            .getAuthConfig()
            .validEmailLogins.find(i => i.email === email);
        if (!found) {
            throw common_types_1.createError(`auth/invalid-email`, `The email provided "${email}" is not a valid email in mocked auth module. If you think it should be, make sure you set it with configureAuth() or setValidEmails()`);
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
        return completeUserCredential_1.completeUserCredential(partial);
    },
    async createUserWithEmailAndPassword(email, password) {
        await util_1.networkDelay();
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
        return completeUserCredential_1.completeUserCredential(partial);
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