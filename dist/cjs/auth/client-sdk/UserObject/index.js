"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notImplemented_1 = require("./notImplemented");
const updateEmail_1 = require("./updateEmail");
const updatePassword_1 = require("./updatePassword");
const updateProfile_1 = require("./updateProfile");
const userProperties_1 = require("./userProperties");
const getIdToken_1 = require("./getIdToken");
exports.clientApiUser = Object.assign(Object.assign(Object.assign({}, notImplemented_1.notImplemented), userProperties_1.userProperties()), { getIdToken: getIdToken_1.getIdToken,
    updateEmail: updateEmail_1.updateEmail,
    updatePassword: updatePassword_1.updatePassword,
    updateProfile: updateProfile_1.updateProfile });
//# sourceMappingURL=index.js.map