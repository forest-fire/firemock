import { FacebookAuthProvider as GoogleFacebookAuthProvider, AuthCredential } from "@firebase/auth-types";
import { FacebookAuthProvider_Instance } from "./FacebookAuthProvider_Instance";
export declare class FacebookAuthProvider extends FacebookAuthProvider_Instance implements GoogleFacebookAuthProvider {
    static PROVIDER_ID: string;
    static FACEBOOK_SIGN_IN_METHOD: string;
    static credential(token: string): AuthCredential;
}
