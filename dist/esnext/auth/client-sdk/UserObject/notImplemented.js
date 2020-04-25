import { fakeApplicationVerifier } from "../completeUserCredential";
export const notImplemented = {
    /** Deletes and signs out the user. */
    async delete() {
        throw new Error("the Mock Auth feature for delete() is not yet implemented");
    },
    async linkAndRetrieveDataWithCredential(credential) {
        throw new Error(`linkAndRetrieveDataWithCredential() is not implemented yet in the client-sdk's mock auth`);
    },
    async linkWithCredential(credential) {
        throw new Error(`linkWithCredential() is not implemented yet in the client-sdk's mock auth`);
    },
    async linkWithPhoneNumber(phoneNUmber, applicationVerificer) {
        return fakeApplicationVerifier;
    },
    async linkWithPopup(provider) {
        throw new Error(`linkWithPopup() is not implemented yet in the client-sdk's mock auth`);
    },
    async linkWithRedirect(provider) {
        return;
    },
    async reauthenticateAndRetrieveDataWithCredential(credential) {
        throw new Error(`reauthenticateAndRetrieveDataWithCredential() is not implemented yet in the client-sdk's mock auth`);
    },
    async reauthenticateWithCredential(credential) {
        throw new Error(`reauthenticateWithCredential() is not implemented yet in the client-sdk's mock auth`);
    },
    async reauthenticateWithPhoneNumber(phoneNumber, applicationVerifier) {
        return fakeApplicationVerifier;
    },
    async reauthenticateWithPopup(provider) {
        throw new Error(`reauthenticateWithPopup() is not implemented yet in the client-sdk's mock auth`);
    },
    async reauthenticateWithRedirect(provider) {
        throw new Error(`reauthenticateWithRedirect() is not implemented yet in the client-sdk's mock auth`);
    },
    async reload() {
        return;
    },
    async sendEmailVerification(actionCodeSettings) {
        throw new Error(`sendEmailVerification() is not implemented yet in the client-sdk's mock auth`);
    },
    toJSON() {
        return {};
    },
    async unlink(provider) {
        throw new Error(`unlink() is not implemented yet in the client-sdk's mock auth`);
    },
    async updatePhoneNumber(phoneCredential) {
        throw new Error(`updatePhoneNumber() is not implemented yet in the client-sdk's mock auth`);
    }
};
//# sourceMappingURL=notImplemented.js.map