import {
  AuthProvider,
  FirebaseAuth,
  ApplicationVerifier
} from "@firebase/auth-types";

// tslint:disable-next-line: class-name
export class PhoneAuthProvider_Instance implements AuthProvider {
  public providerId: string;
  constructor(auth?: FirebaseAuth | null) {}

  public async verifyPhoneNumber(
    phoneNumber: string,
    applicationVerifier: ApplicationVerifier
  ): Promise<string> {
    throw new Error("not implemented");
  }
}
