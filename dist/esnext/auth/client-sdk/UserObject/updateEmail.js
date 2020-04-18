import { FireMockError } from "../../../errors/FireMockError";
import { updateUser, currentUser } from "../../state-mgmt";
import { networkDelay } from "../../../shared/util";
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
export async function updateEmail(newEmail, forceLogin) {
    if (forceLogin) {
        throw new FireMockError("updating a user's email address requires that the user have recently logged in; use 'reauthenticateWithCredential' to address this error.", "auth/requires-recent-login");
    }
    await networkDelay();
    updateUser(currentUser().uid, { email: newEmail });
}
//# sourceMappingURL=updateEmail.js.map