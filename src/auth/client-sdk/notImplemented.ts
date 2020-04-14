import { FirebaseAuth, UserCredential } from "../../@types/auth-types";
import { completeUserCredential } from "./completeUserCredential";
import { createError } from "common-types";

type ActionCodeInfo = import(/* webpackChunkName: "firebase-auth-types" */ "@firebase/auth-types").ActionCodeInfo;

export const notImplemented: Partial<FirebaseAuth> = {
  async applyActionCode(code: string) {
    return;
  },
  async checkActionCode(code: string): Promise<ActionCodeInfo> {
    return {
      data: {},
      operation: ""
    };
  },
  // async createUserAndRetrieveDataWithEmailAndPassword(
  //   email: string,
  //   password: string
  // ): Promise<UserCredential> {
  //   return completeUserCredential({});
  // },

  // async fetchProvidersForEmail(email: string) {
  //   return [];
  // },

  // async signInAnonymouslyAndRetrieveData() {
  //   return completeUserCredential({});
  // },

  // async signInAndRetrieveDataWithCustomToken(token: string) {
  //   return completeUserCredential({});
  // },

  // async signInAndRetrieveDataWithEmailAndPassword(email: string, password: string) {
  //   return completeUserCredential({});
  // },

  async fetchSignInMethodsForEmail() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async getRedirectResult() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  isSignInWithEmailLink() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  onIdTokenChanged() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async sendSignInLinkToEmail() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },

  async signInAndRetrieveDataWithCredential() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },

  async signInWithCredential() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async signInWithCustomToken() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async signInWithEmailLink() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async signInWithPhoneNumber() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async signInWithPopup() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async signInWithRedirect() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async useDeviceLanguage() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async verifyPasswordResetCode(code: string) {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  }
};
