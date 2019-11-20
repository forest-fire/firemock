import { PhoneAuthProvider as GooglePhoneAuthProvider, AuthCredential, PhoneAuthProvider_Instance, ApplicationVerifier } from "@firebase/auth-types";
export declare class PhoneAuthProvider implements PhoneAuthProvider_Instance, GooglePhoneAuthProvider {
    static PROVIDER_ID: string;
    static PHONE_SIGN_IN_METHOD: string;
    static credential(verificationId: string, verificationCode: string): AuthCredential;
    providerId: string;
    verifyPhoneNumber(phoneNumber: string, applicationVerifier: ApplicationVerifier): Promise<string>;
}
