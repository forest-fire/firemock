import {
  GithubAuthProvider as GoogleGithubAuthProvider,
  AuthCredential,
  AuthProvider
} from "@firebase/auth-types";
import { GithubAuthProvider_Instance } from "./GithubAuthProvider_Instance";
import { IDictionary } from "common-types";

export class GithubAuthProvider
  implements GithubAuthProvider_Instance, GoogleGithubAuthProvider {
  public static PROVIDER_ID: string;
  public static GITHUB_SIGN_IN_METHOD: string;

  public static credential(
    idToken?: string | null,
    accessToken?: string | null
  ): AuthCredential {
    throw new Error("not implemented");
  }

  public providerId: string;
  public addScope(scope: string): AuthProvider {
    throw new Error("not implemented");
  }
  public setCustomParameters(params: IDictionary): AuthProvider {
    throw new Error("not implemented");
  }
}
