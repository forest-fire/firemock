import { AuthProvider } from "@firebase/auth-types";
export declare class TwitterAuthProvider_Instance implements AuthProvider {
    providerId: string;
    addScope(scope: string): AuthProvider;
    setCustomParameters(customOAuthParameters: Object): AuthProvider;
}
