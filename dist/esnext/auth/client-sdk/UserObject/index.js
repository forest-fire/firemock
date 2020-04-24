import { notImplemented } from "./notImplemented";
import { updateEmail } from "./updateEmail";
import { updatePassword } from "./updatePassword";
import { updateProfile } from "./updateProfile";
import { userProperties } from "./userProperties";
import { getIdToken } from "./getIdToken";
import { getIdTokenResult } from "./getIdTokenResult";
export const clientApiUser = Object.assign(Object.assign(Object.assign({}, notImplemented), userProperties()), { getIdToken,
    getIdTokenResult,
    updateEmail,
    updatePassword,
    updateProfile });
//# sourceMappingURL=index.js.map