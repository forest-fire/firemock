/**
 * **updatePassword**
 *
 * Updates the password for a logged in user. For security reasons, this operations
 * requires the user to have recently signed in.
 *
 * Errors:
 *
 * - auth/weak-password
 * - auth/required-recent-login ( can use `reauthenticateWithCredential` to resolve this )
 *
 * > Note: the `notRecentLogin` is NOT part of the normal API but allows mock users to force
 * the `auth/required-recent-login` error.
 *
 * [Docs](https://firebase.google.com/docs/reference/js/firebase.User#updatepassword)
 */
export declare function updatePassword(newPassword: string, notRecentLogin?: boolean): Promise<void>;
