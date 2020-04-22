"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./@types"));
__export(require("./rtdb/index"));
__export(require("./mocking/index"));
__export(require("./auth/client-sdk"));
var admin_sdk_1 = require("./auth/admin-sdk");
exports.adminAuthSdk = admin_sdk_1.adminAuthSdk;
//# sourceMappingURL=index.js.map