import {
  FirebaseAuth,
  UserCredential,
  AuthCredential,
  User,
  IEmailLogin,
  IPartialUserCredential
} from "./types";
import { networkDelay } from "../util";
import { authAdminApi } from "./authAdmin";
import { completeUserCredential } from "./completeUserCredential";
import { createError, Omit } from "common-types";
import { notImplemented } from "./notImplemented";
import { ActionCodeSettings } from "@firebase/auth-types";

export const implemented: Omit<FirebaseAuth, keyof typeof notImplemented> = {
  app: {
    name: "mocked-app",
    options: {},
    async delete() {
      return;
    },
    automaticDataCollectionEnabled: false
  },
  signInAnonymously: async (): Promise<UserCredential> => {
    await networkDelay();
    const authConfig = authAdminApi.getAuthConfig();
    if (authConfig.allowAnonymous) {
      const user: Partial<User> = {
        isAnonymous: true,
        uid: authAdminApi.getAnonymousUid(),
        emailVerified: true,
        phoneNumber: ""
      };
      const credential: AuthCredential = {
        signInMethod: "anonymous",
        providerId: "anonymous"
      };

      const credentials = {
        user,
        credential
      };

      return completeUserCredential(credentials);
    } else {
      throw createError(
        "auth/operation-not-allowed",
        "you must enable anonymous auth in the Firebase Console"
      );
    }
  },
  async signInWithEmailAndPassword(email: string, password: string) {
    await networkDelay();
    const found = authAdminApi
      .getAuthConfig()
      .validEmailLogins.find(i => i.email === email);
    if (!found) {
      throw createError(
        `auth/invalid-email`,
        `The email provided "${email}" is not a valid email in mocked auth module. If you think it should be, make sure you set it with configureAuth() or setValidEmails()`
      );
    }
    const partial: IPartialUserCredential = {
      user: {
        email: found.email,
        isAnonymous: false
      },
      credential: {
        signInMethod: "signInWithEmailAndPassword",
        providerId: ""
      }
    };
    return completeUserCredential(partial);
  },

  async createUserWithEmailAndPassword(email: string, password: string) {
    await networkDelay();
    const partial: IPartialUserCredential = {
      user: {
        email,
        isAnonymous: false
      },
      credential: {
        signInMethod: "signInWithEmailAndPassword",
        providerId: ""
      }
    };
    return completeUserCredential(partial);
  },

  async confirmPasswordReset(code: string, newPassword: string) {
    return;
  },

  async sendPasswordResetEmail(email: string, actionCodeSetting: ActionCodeSettings) {
    return;
  },

  async signOut() {
    return;
  },

  get currentUser() {
    return completeUserCredential({}).user;
  },
  languageCode: "",
  async updateCurrentUser() {
    return;
  }
};

export const authMockApi: FirebaseAuth = {
  ...notImplemented,
  ...implemented
};
