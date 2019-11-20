import {
  FacebookAuthProvider as GoogleFacebookAuthProvider,
  AuthCredential,
  AuthProvider
} from "@firebase/auth-types";
import { FacebookAuthProvider_Instance } from "./FacebookAuthProvider_Instance";
import { IDictionary } from "common-types";

export class FacebookAuthProvider
  implements FacebookAuthProvider_Instance, GoogleFacebookAuthProvider {
  public static PROVIDER_ID: string;
  public static FACEBOOK_SIGN_IN_METHOD: string;
  public static credential(token: string): AuthCredential {
    throw new Error("FacebookAuthProvider not implemented yet");
  }
  public providerId: string;
  public addScope(scope: string): AuthProvider {
    throw new Error("not implemented");
  }
  public setCustomParameters(params: IDictionary): AuthProvider {
    throw new Error("not implemented");
  }
}
