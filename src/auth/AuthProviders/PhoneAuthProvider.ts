import {
  PhoneAuthProvider as GooglePhoneAuthProvider,
  AuthCredential,
  PhoneAuthProvider_Instance,
  ApplicationVerifier
} from "@firebase/auth-types";

export class PhoneAuthProvider
  implements PhoneAuthProvider_Instance, GooglePhoneAuthProvider {
  public static PROVIDER_ID: string;
  public static PHONE_SIGN_IN_METHOD: string;

  public static credential(
    verificationId: string,
    verificationCode: string
  ): AuthCredential {
    throw new Error("not implemented");
  }

  public providerId: string;
  public async verifyPhoneNumber(
    phoneNumber: string,
    applicationVerifier: ApplicationVerifier
  ): Promise<string> {
    throw new Error("not-implemented");
  }
}
