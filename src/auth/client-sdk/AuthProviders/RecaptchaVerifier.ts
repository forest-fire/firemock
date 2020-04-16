import {
  RecaptchaVerifier as GoogleRecaptchaVerifier,
  RecaptchaVerifier_Instance
} from "@firebase/auth-types";

export class RecaptchaVerifier
  implements RecaptchaVerifier_Instance, GoogleRecaptchaVerifier {
  public type: string;

  public clear() {
    //
  }

  public async render(): Promise<number> {
    throw new Error("not-implemented");
  }

  public async verify(): Promise<string> {
    throw new Error("not-implemented");
  }
}
