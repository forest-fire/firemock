import { FirebaseAuth } from "./types";
import { completeUserCredential } from "./completeUserCredential";
import { createError } from "common-types";

type ActionCodeInfo = import("@firebase/auth-types").ActionCodeInfo;

export const notImplemented = {
  async applyActionCode(code: string) {
    return;
  },
  async checkActionCode(code: string): Promise<ActionCodeInfo> {
    return {
      data: {},
      operation: ""
    };
  },

  async createUserAndRetrieveDataWithEmailAndPassword() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },

  async fetchProvidersForEmail() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
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
  onAuthStateChanged() {
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
  async setPersistence() {
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
  async signInAndRetrieveDataWithCustomToken() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async signInAndRetrieveDataWithEmailAndPassword() {
    throw createError(
      "auth/not-implemented",
      "This feature is not implemented yet in FireMock auth module"
    );
  },
  async signInAnonymouslyAndRetrieveData() {
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
