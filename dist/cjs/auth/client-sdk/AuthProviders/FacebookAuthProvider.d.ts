import { FacebookAuthProvider as GoogleFacebookAuthProvider, AuthCredential, AuthProvider, FacebookAuthProvider_Instance } from "@firebase/auth-types";
import { IDictionary } from "common-types";
export declare class FacebookAuthProvider implements FacebookAuthProvider_Instance, GoogleFacebookAuthProvider {
    static PROVIDER_ID: string;
    static FACEBOOK_SIGN_IN_METHOD: string;
    static credential(token: string): AuthCredential;
    providerId: string;
    addScope(scope: string): AuthProvider;
    setCustomParameters(params: IDictionary): AuthProvider;
}
