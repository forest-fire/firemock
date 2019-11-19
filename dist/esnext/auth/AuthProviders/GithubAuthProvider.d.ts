import { GithubAuthProvider as GoogleGithubAuthProvider, AuthCredential } from "@firebase/auth-types";
import { GithubAuthProvider_Instance } from "./GithubAuthProvider_Instance";
export declare class GithubAuthProvider extends GithubAuthProvider_Instance implements GoogleGithubAuthProvider {
    static PROVIDER_ID: string;
    static GITHUB_SIGN_IN_METHOD: string;
    static credential(idToken?: string | null, accessToken?: string | null): AuthCredential;
}
