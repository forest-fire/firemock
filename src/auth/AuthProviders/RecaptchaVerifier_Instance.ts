import { ApplicationVerifier } from "@firebase/auth-types";
import { FirebaseApp } from "@firebase/app-types";

// tslint:disable-next-line: class-name
export class RecaptchaVerifier_Instance implements ApplicationVerifier {
  public type: string;

  constructor(
    container: any | string,
    // tslint:disable-next-line: ban-types
    parameters?: Object | null,
    app?: FirebaseApp | null
  ) {}

  public clear(): void {
    //
  }
  public async render(): Promise<number> {
    return 0;
  }

  public async verify(): Promise<string> {
    return "";
  }
}
