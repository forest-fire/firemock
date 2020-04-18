"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireMockError_1 = require("../../../errors/FireMockError");
const state_mgmt_1 = require("../../state-mgmt");
const util_1 = require("../../../shared/util");
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
async function updateEmail(newEmail, forceLogin) {
    if (forceLogin) {
        throw new FireMockError_1.FireMockError("updating a user's email address requires that the user have recently logged in; use 'reauthenticateWithCredential' to address this error.", "auth/requires-recent-login");
    }
    await util_1.networkDelay();
    state_mgmt_1.updateUser(state_mgmt_1.currentUser().uid, { email: newEmail });
}
exports.updateEmail = updateEmail;
//# sourceMappingURL=updateEmail.js.map