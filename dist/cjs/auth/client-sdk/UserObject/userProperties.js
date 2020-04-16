"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../state-mgmt/index");
exports.userProperties = () => ({
    displayName: "",
    email: "",
    isAnonymous: true,
    metadata: {},
    phoneNumber: "",
    photoURL: "",
    providerData: [],
    providerId: "",
    refreshToken: "",
    uid: index_1.getAnonymousUid()
});
//# sourceMappingURL=userProperties.js.map