"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FireMockError_1 = require("../../../errors/FireMockError");
const state_mgmt_1 = require("../../state-mgmt");
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
async function updatePassword(newPassword, notRecentLogin) {
    if (notRecentLogin) {
        throw new FireMockError_1.FireMockError("updating a user's password requires that the user have recently logged in; use 'reauthenticateWithCredential' to address this error.", "auth/required-recent-login");
    }
    state_mgmt_1.updateUser(state_mgmt_1.currentUser().uid, {
        password: newPassword
    });
}
exports.updatePassword = updatePassword;
//# sourceMappingURL=updatePassword.js.map