import { GoogleAuthProvider as GoogleGoogleAuthProvider, AuthCredential } from "@firebase/auth-types";
import { GoogleAuthProvider_Instance } from "./GoogleAuthProvider_Instance";
export declare class GoogleAuthProvider extends GoogleAuthProvider_Instance implements GoogleGoogleAuthProvider {
    static PROVIDER_ID: string;
    static GOOGLE_SIGN_IN_METHOD: string;
    static credential(idToken?: string | null, accessToken?: string | null): AuthCredential;
}
