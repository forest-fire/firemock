import { TwitterAuthProvider as GoogleTwitterAuthProvider, AuthCredential } from "@firebase/auth-types";
import { TwitterAuthProvider_Instance } from "./TwitterAuthProvider_Instance";
export declare class TwitterAuthProvider extends TwitterAuthProvider_Instance implements GoogleTwitterAuthProvider {
    static PROVIDER_ID: string;
    static TWITTER_SIGN_IN_METHOD: string;
    static credential(idToken?: string | null, accessToken?: string | null): AuthCredential;
}
