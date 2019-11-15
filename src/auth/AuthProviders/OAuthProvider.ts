import {
  OAuthProvider as GoogleOAuthProvider,
  AuthProvider,
  OAuthCredential
} from "@firebase/auth-types";

export class OAuthProvider implements GoogleOAuthProvider {
  public providerId: string;
  // tslint:disable-next-line: no-empty
  constructor(providerId: string) {}
  public addScope(scope: string): AuthProvider {
    throw new Error("not implemented");
  }
  public credential(idToken?: string, accessToken?: string): OAuthCredential {
    throw new Error("not implemented");
  }
  // tslint:disable-next-line: ban-types
  public setCustomParameters(customOAuthParameters: Object): AuthProvider {
    throw new Error("not implemented");
  }
}
