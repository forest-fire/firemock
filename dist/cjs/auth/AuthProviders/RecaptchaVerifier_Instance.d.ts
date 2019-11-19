import { ApplicationVerifier } from "@firebase/auth-types";
import { FirebaseApp } from "@firebase/app-types";
export declare class RecaptchaVerifier_Instance implements ApplicationVerifier {
    type: string;
    constructor(container: any | string, parameters?: Object | null, app?: FirebaseApp | null);
    clear(): void;
    render(): Promise<number>;
    verify(): Promise<string>;
}
