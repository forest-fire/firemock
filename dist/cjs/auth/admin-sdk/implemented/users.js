"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_mgmt_1 = require("../../state-mgmt");
const shared_1 = require("../../../shared");
exports.users = {
    // https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
    async createUser(properties) {
        state_mgmt_1.addUser(Object.assign({ password: Math.random()
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
        state_mgmt_1.updateUser(uid, properties);
        return state_mgmt_1.getUserById(uid);
    },
    async deleteUser(uid) {
        await shared_1.networkDelay();
        state_mgmt_1.removeUser(uid);
    },
    async getUserByEmail(email) {
        await shared_1.networkDelay();
        return state_mgmt_1.getUserByEmail(email);
    },
    async getUserByPhoneNumber(phoneNumber) {
        return;
    },
    async listUsers(maxResults, pageToken) {
        await shared_1.networkDelay();
        return { users: maxResults ? state_mgmt_1.allUsers().slice(0, maxResults) : state_mgmt_1.allUsers() };
    }
};
//# sourceMappingURL=users.js.map