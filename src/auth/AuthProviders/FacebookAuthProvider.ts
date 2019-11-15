import {
  FacebookAuthProvider as GoogleFacebookAuthProvider,
  AuthCredential
} from "@firebase/auth-types";
import { FacebookAuthProvider_Instance } from "./FacebookAuthProvider_Instance";

export class FacebookAuthProvider extends FacebookAuthProvider_Instance
  implements GoogleFacebookAuthProvider {
  public static PROVIDER_ID: string;
  public static FACEBOOK_SIGN_IN_METHOD: string;
  public static credential(token: string): AuthCredential {
    throw new Error("FacebookAuthProvider not implemented yet");
  }
}
