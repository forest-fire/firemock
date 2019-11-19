import { AuthProvider } from "@firebase/auth-types";
export declare class FacebookAuthProvider_Instance implements AuthProvider {
    providerId: string;
    addScope(scope: string): AuthProvider;
    setCustomParameters(customOAuthParameters: Object): AuthProvider;
}
