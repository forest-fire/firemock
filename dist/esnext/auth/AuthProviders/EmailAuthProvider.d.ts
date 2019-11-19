declare type AuthCredential = import("@firebase/auth-types").AuthCredential;
declare type EmailAuthProvider_Instance = import("@firebase/auth-types").EmailAuthProvider_Instance;
declare type GoogleEmailAuthProvider = import("@firebase/auth-types").EmailAuthProvider;
/**
 * **EmailAuthProvider** API mocking. Details on the API can be found
 * here: https://firebase.google.com/docs/reference/js/firebase.auth.EmailAuthProvider
 */
export declare class EmailAuthProvider implements EmailAuthProvider_Instance, GoogleEmailAuthProvider {
    static PROVIDER_ID: string;
    static EMAIL_PASSWORD_SIGN_IN_METHOD: string;
    static EMAIL_LINK_SIGN_IN_METHOD: string;
    /**
     * Produces a `credential` to a user account (typically an anonymous account)
     * which can then be linked to the account using `linkWithCredential`.
     */
    static credential(email: string, password: string): AuthCredential;
    /**
     * Initialize an EmailAuthProvider credential using an email and an email link after
     * a sign in with email link operation.
     */
    static credentialWithLink(email: string, emailLink: string): AuthCredential;
    providerId: string;
}
export {};
