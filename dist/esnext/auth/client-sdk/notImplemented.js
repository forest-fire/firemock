import { createError } from "common-types";
export const notImplemented = {
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
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async getRedirectResult() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    isSignInWithEmailLink() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    onIdTokenChanged() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async sendSignInLinkToEmail() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInAndRetrieveDataWithCredential() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithCredential() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithCustomToken() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithEmailLink() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithPhoneNumber() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithPopup() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async signInWithRedirect() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async useDeviceLanguage() {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    },
    async verifyPasswordResetCode(code) {
        throw createError("auth/not-implemented", "This feature is not implemented yet in FireMock auth module");
    }
};
//# sourceMappingURL=notImplemented.js.map