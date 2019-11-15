import {
  PhoneAuthProvider as GooglePhoneAuthProvider,
  AuthCredential
} from "@firebase/auth-types";
import { PhoneAuthProvider_Instance } from "./PhoneAuthProvider_Instance";

export class PhoneAuthProvider extends PhoneAuthProvider_Instance
  implements GooglePhoneAuthProvider {
  public static PROVIDER_ID: string;
  public static PHONE_SIGN_IN_METHOD: string;

  public static credential(
    verificationId: string,
    verificationCode: string
  ): AuthCredential {
    throw new Error("not implemented");
  }
}
