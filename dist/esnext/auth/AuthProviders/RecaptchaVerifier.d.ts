import { RecaptchaVerifier as GoogleRecaptchaVerifier, RecaptchaVerifier_Instance } from "@firebase/auth-types";
export declare class RecaptchaVerifier implements RecaptchaVerifier_Instance, GoogleRecaptchaVerifier {
    type: string;
    clear(): void;
    render(): Promise<number>;
    verify(): Promise<string>;
}
