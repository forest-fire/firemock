import {
  AuthCredential,
  EmailAuthProvider_Instance,
  EmailAuthProvider as GoogleEmailAuthProvider
} from "@firebase/auth-types";

/**
 * **EmailAuthProvider** API mocking. Details on the API can be found
 * here: https://firebase.google.com/docs/reference/js/firebase.auth.EmailAuthProvider
 */
export class EmailAuthProvider extends EmailAuthProvider_Instance
  implements GoogleEmailAuthProvider {
  public static PROVIDER_ID: string;
  public static EMAIL_PASSWORD_SIGN_IN_METHOD: string;
  public static EMAIL_LINK_SIGN_IN_METHOD: string;
  /**
   * Produces a `credential` to a user account (typically an anonymous account)
   * which can then be linked to the account using `linkWithCredential`.
   */
  public static credential(email: string, password: string): AuthCredential {
    const data = {
      providerId: "mock-provider-id-for-EmailAuthProvider",
      signInMethod: "email-and-password"
    };

    return {
      ...data,
      toJSON() {
        return JSON.stringify(data);
      }
    };
  }

  /**
   * Initialize an EmailAuthProvider credential using an email and an email link after
   * a sign in with email link operation.
   */
  public static credentialWithLink(
    email: string,
    emailLink: string
  ): AuthCredential {
    const data = {
      providerId: "mock-provider-id-for-EmailAuthProvider",
      signInMethod: "email-and-password"
    };

    return {
      ...data,
      toJSON() {
        return JSON.stringify(data);
      }
    };
  }
}
