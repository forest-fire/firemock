/**
 * **updateEmail**
 *
 * Gives a logged in user the ability to update their email address.
 *
 * Possible Errors:
 *
 * - auth/invalid-email
 * - auth/email-already-in-use
 * - auth/requires-recent-login
 *
 * [Documentation](https://firebase.google.com/docs/reference/js/firebase.User#update-email)
 *
 * > Note: The `forceLogin` is not part of Firebase API but allows mock user to force the
 * error condition associated with a user who's been logged in a long time.
 */
export declare function updateEmail(newEmail: string, forceLogin?: boolean): Promise<void>;
