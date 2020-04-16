import { addUser } from "../../state-mgmt";
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
            }, multiFactor: null, toJSON: () => properties, providerData: null });
    },
    /** Updates an existing user. */
    async updateUser(uid, properties) {
        return;
    },
    async deleteUser(uid) {
        return;
    },
    async getUserByEmail(email) {
        return;
    },
    async getUserByPhoneNumber(phoneNumber) {
        return;
    },
    async listUsers(maxResults, pageToken) {
        return;
    }
};
//# sourceMappingURL=users.js.map