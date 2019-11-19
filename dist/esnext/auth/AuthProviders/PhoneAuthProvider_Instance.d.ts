import { AuthProvider, FirebaseAuth, ApplicationVerifier } from "@firebase/auth-types";
export declare class PhoneAuthProvider_Instance implements AuthProvider {
    providerId: string;
    constructor(auth?: FirebaseAuth | null);
    verifyPhoneNumber(phoneNumber: string, applicationVerifier: ApplicationVerifier): Promise<string>;
}
