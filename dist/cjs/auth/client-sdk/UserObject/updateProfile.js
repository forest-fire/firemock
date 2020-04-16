"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_mgmt_1 = require("../../state-mgmt");
/**
 * Updates a user's profile data.
 *
 * Example:
 *
 * ```typescript
 * user.updateProfile({
      displayName: "Jane Q. User",
      photoURL: "https://example.com/jane-q-user/profile.jpg"
  })
 * ```

 [Documentation](https://firebase.google.com/docs/reference/js/firebase.User#updateprofile)
 */
async function updateProfile(profile) {
    state_mgmt_1.updateUser(state_mgmt_1.currentUser().uid, profile);
}
exports.updateProfile = updateProfile;
//# sourceMappingURL=updateProfile.js.map