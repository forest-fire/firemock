import {
  FirebaseAuth,
  UserCredential,
  AuthCredential,
  User,
  IPartialUserCredential
} from "../../@types/auth-types";
import { networkDelay } from "../../util";
import { authAdminApi, Observer } from "../state-mgmt/authAdminApi";
import { completeUserCredential } from "./completeUserCredential";
import { Omit } from "common-types";
import { notImplemented } from "./notImplemented";
import { ActionCodeSettings } from "@firebase/auth-types";
import { FireMockError } from "../../errors/FireMockError";
import {
  emailExistsAsUserInAuth,
  emailHasCorrectPassword,
  emailVerified,
  userUid,
  emailValidationAllowed,
  emailIsValidFormat
} from "./authMockHelpers";
import { addUser, allUsers, authProviders } from "../state-mgmt";

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
  async setPersistence() {
    console.warn(
      `currently firemock accepts calls to setPersistence() but it doesn't support it.`
    );
  },
  signInAnonymously: async (): Promise<UserCredential> => {
    await networkDelay();

    if (authProviders().includes("anonymous")) {
      const user: Partial<User> = {
        isAnonymous: true,
        uid: authAdminApi.getAnonymousUid(),
        emailVerified: false,
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

      const userCredential = completeUserCredential(credentials);
      authAdminApi.login(userCredential.user);

      return userCredential;
    } else {
      throw new FireMockError(
        "you must enable anonymous auth in the Firebase Console",
        "auth/operation-not-allowed"
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
    if (!emailIsValidFormat(email)) {
      throw new FireMockError(`invalid email: ${email}`, "auth/invalid-email");
    }
    const found = allUsers().find(i => i.email === email);
    if (!found) {
      throw new FireMockError(
        `The email "${email}" was not found`,
        `auth/user-not-found`
      );
    }

    if (!emailHasCorrectPassword(email, password)) {
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

    if (emailExistsAsUserInAuth(email)) {
      throw new FireMockError(
        `"${email}" user already exists`,
        "auth/email-already-in-use"
      );
    }

    if (!emailIsValidFormat(email)) {
      throw new FireMockError(
        `"${email}" is not a valid email format`,
        "auth/invalid-email"
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
    addUser({ uid: partial.user.uid, email, password });
    authAdminApi.login(u.user);

    return u;
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
