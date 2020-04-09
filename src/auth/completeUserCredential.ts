import {
  IPartialUserCredential,
  UserCredential,
  AuthCredential
} from "../@types/auth-types";
import {
  ApplicationVerifier,
  AuthProvider,
  ActionCodeSettings
} from "@firebase/auth-types";
import { authAdminApi } from "./authAdminApi";
import merge from "deepmerge";
import { atRandom } from "../shared/atRandom";
import { updateEmail, updatePassword, getIdToken } from "./UserObject";

/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
export function completeUserCredential(
  partial: IPartialUserCredential
): UserCredential {
  const fakeUserCredential: UserCredential = {
    user: {
      verifyBeforeUpdateEmail: (newEmail, actionCodeSettings) => {
        return Promise.resolve();
      },
      multiFactor: {
        enroll: (assertion, displayName) => {
          return Promise.resolve();
        },
        enrolledFactors: [],
        getSession: () => {
          return Promise.resolve({});
        },
        unenroll: option => {
          return Promise.resolve();
        }
      },
      tenantId: "fake-tenantId",
      async delete() {
        return;
      },
      emailVerified: false,
      async getIdTokenResult() {
        const user =
          partial.user && partial.user.uid
            ? authAdminApi
                .getValidEmailUsers()
                .find(i => i.uid === partial.user.uid)
            : undefined;
        const token =
          user && user.tokenIds ? atRandom(user.tokenIds) : "random-token";
        const claims = user && user.claims ? user.claims : {};
        return {
          token,
          expirationTime: "format?",
          authTime: "format?",
          issuedAtTime: "format?",
          signInProvider: "fake",
          signInSecondFactor: "fake-2nd-factor",
          claims
        };
      },
      updateEmail,
      updatePassword,
      getIdToken,

      async linkAndRetrieveDataWithCredential(credential: AuthCredential) {
        return completeUserCredential({});
      },

      async linkWithCredential(credential: AuthCredential) {
        return completeUserCredential({});
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
      async reauthenticateAndRetrieveDataWithCredential(
        credential: AuthCredential
      ) {
        return completeUserCredential({});
      },
      async reauthenticateWithCredential(credential: AuthCredential) {
        return completeUserCredential({});
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

      async updatePhoneNumber(phoneCredential: AuthCredential) {
        return;
      },
      async updateProfile(profile: {
        displayName?: string;
        photoUrl?: string;
      }) {
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
      providerId: "fake",
      toJSON: () => "" // added recently
    }
  };

  return merge(fakeUserCredential, partial) as UserCredential;
}

const fakeApplicationVerifier = {
  async confirm(verificationCode: string) {
    return completeUserCredential({});
  },
  verificationId: "verification"
};
