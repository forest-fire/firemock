import {
  GithubAuthProvider as GoogleGithubAuthProvider,
  AuthCredential
} from "@firebase/auth-types";
import { GithubAuthProvider_Instance } from "./GithubAuthProvider_Instance";

export class GithubAuthProvider extends GithubAuthProvider_Instance
  implements GoogleGithubAuthProvider {
  public static PROVIDER_ID: string;
  public static GITHUB_SIGN_IN_METHOD: string;

  public static credential(
    idToken?: string | null,
    accessToken?: string | null
  ): AuthCredential {
    throw new Error("not implemented");
  }
}
