const data = {
    providerId: "mock-provider-id-for-EmailAuthProvider",
    signInMethod: "email-and-password"
};
/**
 * **EmailAuthProvider** API mocking. Details on the API can be found
 * here: https://firebase.google.com/docs/reference/js/firebase.auth.EmailAuthProvider
 */
export class EmailAuthProvider {
    constructor() {
        this.providerId = data.providerId;
    }
    /**
     * Produces a `credential` to a user account (typically an anonymous account)
     * which can then be linked to the account using `linkWithCredential`.
     */
    static credential(email, password) {
        return Object.assign(Object.assign({}, data), { toJSON() {
                return JSON.stringify(data);
            } });
    }
    /**
     * Initialize an EmailAuthProvider credential using an email and an email link after
     * a sign in with email link operation.
     */
    static credentialWithLink(email, emailLink) {
        return Object.assign(Object.assign({}, data), { toJSON() {
                return JSON.stringify(data);
            } });
    }
}
//# sourceMappingURL=EmailAuthProvider.js.map