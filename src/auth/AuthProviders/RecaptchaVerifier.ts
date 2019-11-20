import { RecaptchaVerifier as GoogleRecaptchaVerifier } from "@firebase/auth-types";
import { RecaptchaVerifier_Instance } from "./RecaptchaVerifier_Instance";

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
