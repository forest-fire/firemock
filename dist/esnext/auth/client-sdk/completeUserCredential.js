import merge from "deepmerge";
import { clientApiUser } from "./UserObject";
import { getRandomMockUid } from "../state-mgmt";
/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
export function completeUserCredential(partial) {
    const fakeUserCredential = {
        user: Object.assign(Object.assign({}, clientApiUser), { displayName: "", email: "", isAnonymous: true, metadata: {}, phoneNumber: "", photoURL: "", providerData: [], providerId: "", refreshToken: "", uid: getRandomMockUid() }),
        additionalUserInfo: {
            isNewUser: false,
            profile: "",
            providerId: "",
            username: "fake"
        },
        operationType: "",
        credential: {
            signInMethod: "fake",
            providerId: "fake",
            toJSON: () => "" // added recently
        }
    };
    return merge(fakeUserCredential, partial);
}
export const fakeApplicationVerifier = {
    async confirm(verificationCode) {
        return completeUserCredential({});
    },
    verificationId: "verification"
};
//# sourceMappingURL=completeUserCredential.js.map