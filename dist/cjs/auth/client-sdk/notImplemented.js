"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
exports.notImplemented = {
    async applyActionCode(code) {
        return;
    },
    async checkActionCode(code) {
        return {
            data: {},
            operation: ""
        };
    },
    // async createUserAndRetrieveDataWithEmailAndPassword(
    //   email: string,
    //   password: string
    // ): Promise<UserCredential> {
    //   return completeUserCredential({});
    // },
    // async fetchProvidersForEmail(email: string) {
    //   return [];
    // },
    // async signInAnonymouslyAndRetrieveData() {
    //   return completeUserCredential({});
    // },
    // async signInAndRetrieveDataWithCustomToken(token: string) {
    //   return completeUserCredential({});
    // },
    // async signInAndRetrieveDataWithEmailAndPassword(email: string, password: string) {
    //   return completeUserCredential({});
    // },
    async fetchSignInMethodsForEmail() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async getRedirectResult() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    isSignInWithEmailLink() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    onIdTokenChanged() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async sendSignInLinkToEmail() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInAndRetrieveDataWithCredential() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithCredential() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithCustomToken() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithEmailLink() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithPhoneNumber() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithPopup() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithRedirect() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async useDeviceLanguage() {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async verifyPasswordResetCode(code) {
        throw common_types_1.createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    }
};
//# sourceMappingURL=notImplemented.js.map