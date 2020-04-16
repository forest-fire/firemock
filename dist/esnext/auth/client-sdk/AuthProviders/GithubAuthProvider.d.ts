import { GithubAuthProvider as GoogleGithubAuthProvider, AuthCredential, AuthProvider, GithubAuthProvider_Instance } from "@firebase/auth-types";
import { IDictionary } from "common-types";
export declare class GithubAuthProvider implements GithubAuthProvider_Instance, GoogleGithubAuthProvider {
    static PROVIDER_ID: string;
    static GITHUB_SIGN_IN_METHOD: string;
    static credential(idToken?: string | null, accessToken?: string | null): AuthCredential;
    providerId: string;
    addScope(scope: string): AuthProvider;
    setCustomParameters(params: IDictionary): AuthProvider;
}
