import {
  FirebaseAuth,
  UserCredential,
  AuthCredential,
  User,
  IPartialUserCredential
} from "./types";
import { networkDelay } from "../util";
import { authAdminApi, Observer } from "./authAdmin";
import { completeUserCredential } from "./completeUserCredential";
import { createError, Omit } from "common-types";
import { notImplemented } from "./notImplemented";
import {
  ActionCodeSettings,
  TwitterAuthProvider_Instance
} from "@firebase/auth-types";
import { FireMockError } from "../errors/FireMockError";
import {
  checkIfEmailUserExists,
  validEmailUserPassword,
  emailVerified,
  userUid,
  emailValidationAllowed,
  checkIfEmailIsValidFormat
} from "./authMockHelpers";

export const implemented: Omit<FirebaseAuth, keyof typeof notImplemented> = {
  app: {
    name: "mocked-app",
    options: {},
    async delete() {
      return;
    },
    automaticDataCollectionEnabled: false
  },
  onAuthStateChanged(observer: Observer) {
    authAdminApi.addAuthObserver(observer);
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
        providerId: "anonymous",
        toJSON: () => "" // recently added
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
    if (!emailValidationAllowed()) {
      throw new FireMockError(
        "email authentication not allowed",
        "auth/operation-not-allowed"
      );
    }
    if (!checkIfEmailIsValidFormat(email)) {
      throw new FireMockError(`invalid email: ${email}`, "auth/invalid-email");
    }
    const found = authAdminApi
      .getAuthConfig()
      .validEmailUsers.find(i => i.email === email);
    if (!found) {
      throw createError(
        `auth/user-not-found`,
        `The email "${email}" was not found`
      );
    }

    if (!validEmailUserPassword(email, found.password)) {
      throw new FireMockError(
        `Invalid password for ${email}`,
        "auth/wrong-password"
      );
    }
    const partial: IPartialUserCredential = {
      user: {
        email: found.email,
        isAnonymous: false,
        emailVerified: emailVerified(email),
        uid: userUid(email)
      },
      credential: {
        signInMethod: "signInWithEmailAndPassword",
        providerId: ""
      },
      additionalUserInfo: {
        username: email
      }
    };
    const u = completeUserCredential(partial);
    authAdminApi.login(u.user);
    return u;
  },

  /**
   * Add a new user with the Email/Password provider
   */
  async createUserWithEmailAndPassword(email: string, password: string) {
    await networkDelay();
    if (!emailValidationAllowed()) {
      throw new FireMockError(
        "email authentication not allowed",
        "auth/operation-not-allowed"
      );
    }

    if (checkIfEmailUserExists(email)) {
      throw new FireMockError(
        `"${email}" user already exists`,
        "auth/email-already-in-use"
      );
    }

    if (checkIfEmailIsValidFormat(email)) {
      throw new FireMockError(
        `"${email}" user already exists`,
        "auth/invalid-email"
      );
    }

    if (!validEmailUserPassword(email, password)) {
      throw new FireMockError(
        `invalid password for "${email}" user`,
        "firemock/denied"
      );
    }

    const partial: IPartialUserCredential = {
      user: {
        email,
        isAnonymous: false,
        emailVerified: false,
        uid: userUid(email)
      },
      credential: {
        signInMethod: "signInWithEmailAndPassword",
        providerId: ""
      },
      additionalUserInfo: {
        username: email
      }
    };
    const u = completeUserCredential(partial);
    authAdminApi.addUserToAuth(u.user, password);
    authAdminApi.login(u.user);
    return completeUserCredential(partial);
  },

  async confirmPasswordReset(code: string, newPassword: string) {
    return;
  },

  async sendPasswordResetEmail(
    email: string,
    actionCodeSetting: ActionCodeSettings
  ) {
    return;
  },

  async signOut() {
    authAdminApi.logout();
  },

  get currentUser() {
    return completeUserCredential({}).user;
  },
  languageCode: "",
  async updateCurrentUser() {
    return;
  },
  settings: {
    appVerificationDisabledForTesting: false
  }
};

// tslint:disable-next-line:no-object-literal-type-assertion
export const authMockApi = {
  ...notImplemented,
  ...implemented
} as FirebaseAuth;
