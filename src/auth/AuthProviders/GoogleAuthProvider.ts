import {
  GoogleAuthProvider as GoogleGoogleAuthProvider,
  AuthCredential
} from "@firebase/auth-types";
import { GoogleAuthProvider_Instance } from "./GoogleAuthProvider_Instance";

export class GoogleAuthProvider extends GoogleAuthProvider_Instance
  implements GoogleGoogleAuthProvider {
  public static PROVIDER_ID: string;
  public static GOOGLE_SIGN_IN_METHOD: string;

  public static credential(
    idToken?: string | null,
    accessToken?: string | null
  ): AuthCredential {
    throw new Error("not implemented");
  }
}
