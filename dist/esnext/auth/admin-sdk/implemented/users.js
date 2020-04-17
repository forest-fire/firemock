import { addUser, updateUser, getUserById, removeUser, getUserByEmail, allUsers } from "../../state-mgmt";
import { networkDelay } from "../../../shared/util";
export const users = {
    // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
    async createUser(properties) {
        addUser(Object.assign({ password: Math.random()
                .toString(36)
                .substr(2, 10), multiFactor: null }, properties));
        return Object.assign(Object.assign({}, properties), { metadata: {
                lastSignInTime: null,
                creationTime: String(new Date()),
                toJSON() {
                    return {};
                }
            }, multiFactor: null, toJSON: () => null, providerData: null });
    },
    /** Updates an existing user. */
    async updateUser(uid, properties) {
        updateUser(uid, properties);
        return getUserById(uid);
    },
    async deleteUser(uid) {
        await networkDelay();
        removeUser(uid);
    },
    async getUserByEmail(email) {
        await networkDelay();
        return getUserByEmail(email);
    },
    async getUserByPhoneNumber(phoneNumber) {
        return;
    },
    async listUsers(maxResults, pageToken) {
        await networkDelay();
        return { users: maxResults ? allUsers().slice(0, maxResults) : allUsers() };
    }
};
//# sourceMappingURL=users.js.map