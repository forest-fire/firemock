import { PhoneAuthProvider as GooglePhoneAuthProvider, AuthCredential } from "@firebase/auth-types";
import { PhoneAuthProvider_Instance } from "./PhoneAuthProvider_Instance";
export declare class PhoneAuthProvider extends PhoneAuthProvider_Instance implements GooglePhoneAuthProvider {
    static PROVIDER_ID: string;
    static PHONE_SIGN_IN_METHOD: string;
    static credential(verificationId: string, verificationCode: string): AuthCredential;
}
