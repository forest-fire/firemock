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
import { authAdminApi } from "./authAdmin";
import merge from "deepmerge";
import { atRandom } from "../shared/atRandom";

/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
export function completeUserCredential(
  partial: IPartialUserCredential
): UserCredential {
  const fakeUserCredential: UserCredential = {
    user: {
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
          claims
        };
      },
      async getIdToken() {
        const user = authAdminApi.getCurrentUser();
        const userConfig = authAdminApi
          .getAuthConfig()
          .validEmailUsers.find(i => i.email === user.email);

        if (!user) {
          throw new Error("not logged in");
        }
        if (userConfig.tokenIds) {
          return atRandom(userConfig.tokenIds);
        } else {
          return Math.random()
            .toString(36)
            .substr(2, 10);
        }
      },
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
      // async reauthenticateWithCredential(credential: AuthCredential) {
      //   return;
      // },
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
      async updateEmail(newEmail: string) {
        return;
      },
      updatePassword: async (password: string) => {
        if (partial.user.email) {
          authAdminApi.updateEmailUser(partial.user.email, { password });
        }
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
