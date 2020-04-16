import { getAnonymousUid } from "../../state-mgmt/index";
export const userProperties = () => ({
    displayName: "",
    email: "",
    isAnonymous: true,
    metadata: {},
    phoneNumber: "",
    photoURL: "",
    providerData: [],
    providerId: "",
    refreshToken: "",
    uid: getAnonymousUid()
});
//# sourceMappingURL=userProperties.js.map