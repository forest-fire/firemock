import {
  TwitterAuthProvider as GoogleTwitterAuthProvider,
  AuthCredential
} from "@firebase/auth-types";
import { TwitterAuthProvider_Instance } from "./TwitterAuthProvider_Instance";

export class TwitterAuthProvider extends TwitterAuthProvider_Instance
  implements GoogleTwitterAuthProvider {
  public static PROVIDER_ID: string;
  public static TWITTER_SIGN_IN_METHOD: string;

  public static credential(
    idToken?: string | null,
    accessToken?: string | null
  ): AuthCredential {
    throw new Error("not implemented");
  }
}
