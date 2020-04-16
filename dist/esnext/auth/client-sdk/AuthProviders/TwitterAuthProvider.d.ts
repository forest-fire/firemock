import { TwitterAuthProvider as GoogleTwitterAuthProvider, AuthCredential, TwitterAuthProvider_Instance, AuthProvider } from "@firebase/auth-types";
import { IDictionary } from "common-types";
export declare class TwitterAuthProvider implements GoogleTwitterAuthProvider, TwitterAuthProvider_Instance {
    static PROVIDER_ID: string;
    static TWITTER_SIGN_IN_METHOD: string;
    static credential(idToken?: string | null, accessToken?: string | null): AuthCredential;
    providerId: string;
    addScope(scope: string): AuthProvider;
    setCustomParameters(params: IDictionary): AuthProvider;
}
