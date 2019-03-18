import { authApi } from "../auth";
let authConfig = {
    allowAnonymous: true
};
let ANONYMOUS_USER_ID = "123456";
export const authAdminApi = {
    configureAuth(config) {
        authConfig = Object.assign({}, authConfig, config);
    },
    getValidEmails() {
        return authConfig.validEmailLogins || [];
    },
    getAuthConfig() {
        return authConfig;
    },
    setAnonymousUser(uid) {
        ANONYMOUS_USER_ID = uid;
        return authApi;
    },
    getAnonymousUid() {
        return ANONYMOUS_USER_ID;
    }
};
