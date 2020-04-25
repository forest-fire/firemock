import {
  User,
  IdTokenResult,
  AuthCredential,
  ApplicationVerifier,
  AuthProvider,
  ActionCodeSettings
} from "../../../@types";
import { UserCredential } from "@firebase/auth-types";
import { fakeApplicationVerifier } from "../completeUserCredential";

export const notImplemented: Partial<User> = {
  /** Deletes and signs out the user. */
  async delete(): Promise<void> {
    throw new Error(
      "the Mock Auth feature for delete() is not yet implemented"
    );
  },

  async linkAndRetrieveDataWithCredential(credential: AuthCredential) {
    throw new Error(
      `linkAndRetrieveDataWithCredential() is not implemented yet in the client-sdk's mock auth`
    );
  },

  async linkWithCredential(credential: AuthCredential) {
    throw new Error(
      `linkWithCredential() is not implemented yet in the client-sdk's mock auth`
    );
  },

  async linkWithPhoneNumber(
    phoneNUmber: string,
    applicationVerificer: ApplicationVerifier
  ) {
    return fakeApplicationVerifier;
  },

  async linkWithPopup(provider: AuthProvider) {
    throw new Error(
      `linkWithPopup() is not implemented yet in the client-sdk's mock auth`
    );
  },
  async linkWithRedirect(provider: AuthProvider) {
    return;
  },
  async reauthenticateAndRetrieveDataWithCredential(
    credential: AuthCredential
  ) {
    throw new Error(
      `reauthenticateAndRetrieveDataWithCredential() is not implemented yet in the client-sdk's mock auth`
    );
  },
  async reauthenticateWithCredential(credential: AuthCredential) {
    throw new Error(
      `reauthenticateWithCredential() is not implemented yet in the client-sdk's mock auth`
    );
  },
  async reauthenticateWithPhoneNumber(
    phoneNumber: string,
    applicationVerifier: ApplicationVerifier
  ) {
    return fakeApplicationVerifier;
  },
  async reauthenticateWithPopup(
    provider: AuthProvider
  ): Promise<UserCredential> {
    throw new Error(
      `reauthenticateWithPopup() is not implemented yet in the client-sdk's mock auth`
    );
  },
  async reauthenticateWithRedirect(provider: AuthProvider) {
    throw new Error(
      `reauthenticateWithRedirect() is not implemented yet in the client-sdk's mock auth`
    );
  },
  async reload() {
    return;
  },
  async sendEmailVerification(actionCodeSettings: ActionCodeSettings) {
    throw new Error(
      `sendEmailVerification() is not implemented yet in the client-sdk's mock auth`
    );
  },
  toJSON() {
    return {};
  },
  async unlink(provider: string) {
    throw new Error(
      `unlink() is not implemented yet in the client-sdk's mock auth`
    );
  },
  async updatePhoneNumber(phoneCredential: AuthCredential) {
    throw new Error(
      `updatePhoneNumber() is not implemented yet in the client-sdk's mock auth`
    );
  }
};
