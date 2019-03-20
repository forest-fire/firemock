import { IPartialUserCredential, UserCredential, AuthCredential } from "./types";
import {
  ApplicationVerifier,
  AuthProvider,
  ActionCodeSettings
} from "@firebase/auth-types";
import { authAdminApi } from "./authAdmin";

/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
export function completeUserCredential(partial: IPartialUserCredential): UserCredential {
  const combined = {
    ...fakeUserCredential,
    ...partial
  };
  return combined as UserCredential;
}

const fakeUserCredential: UserCredential = {
  user: {
    async delete() {
      return;
    },
    emailVerified: false,
    async getIdTokenResult() {
      return {
        token: "abc",
        expirationTime: "format?",
        authTime: "format?",
        issuedAtTime: "format?",
        signInProvider: "fake",
        claims: {
          foobar: "abc"
        }
      };
    },
    async getIdToken() {
      return "abc";
    },
    async linkAndRetrieveDataWithCredential(credential: AuthCredential) {
      return completeUserCredential({});
    },
    async linkWithCredential(credential: AuthCredential) {
      return completeUserCredential({}).user;
    },
    async linkWithPhoneNumber(
      phoneNUmber: string,
      applicationVerificer: ApplicationVerifier
    ) {
      return fakeApplicationVerifier;
    },
    async linkWithPopup(provider: AuthProvider) {
      return completeUserCredential({});
    },
    async linkWithRedirect(provider: AuthProvider) {
      return;
    },
    async reauthenticateAndRetrieveDataWithCredential(credential: AuthCredential) {
      return completeUserCredential({});
    },
    async reauthenticateWithCredential(credential: AuthCredential) {
      return;
    },
    async reauthenticateWithPhoneNumber(
      phoneNumber: string,
      applicationVerifier: ApplicationVerifier
    ) {
      return fakeApplicationVerifier;
    },
    async reauthenticateWithPopup(provider: AuthProvider) {
      return completeUserCredential({});
    },
    async reauthenticateWithRedirect(provider: AuthProvider) {
      return;
    },
    async reload() {
      return;
    },
    async sendEmailVerification(actionCodeSettings: ActionCodeSettings) {
      return;
    },
    toJSON() {
      return {};
    },
    async unlink(provider: string) {
      return completeUserCredential({}).user;
    },
    async updateEmail(newEmail: string) {
      return;
    },
    async updatePassword(newPassword: string) {
      return;
    },
    async updatePhoneNumber(phoneCredential: AuthCredential) {
      return;
    },
    async updateProfile(profile: { displayName?: string; photoUrl?: string }) {
      return;
    },
    displayName: "",
    email: "",
    isAnonymous: true,
    metadata: {},
    phoneNumber: "",
    photoURL: "",
    providerData: [],
    providerId: "",
    refreshToken: "",
    uid: authAdminApi.getAnonymousUid()
  },
  additionalUserInfo: {
    isNewUser: false,
    profile: "",
    providerId: "",
    username: "fake"
  },
  operationType: "",
  credential: {
    signInMethod: "fake",
    providerId: "fake"
  }
};

const fakeApplicationVerifier = {
  async confirm(verificationCode: string) {
    return completeUserCredential({});
  },
  verificationId: "verification"
};
