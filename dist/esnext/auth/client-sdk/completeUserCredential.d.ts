import { IPartialUserCredential, UserCredential } from "../../@types/auth-types";
/**
 * takes a partial user auth and adds enough to make it officially
 * a full UserCrediental
 */
export declare function completeUserCredential(partial: IPartialUserCredential): UserCredential;
export declare const fakeApplicationVerifier: {
    confirm(verificationCode: string): Promise<import("@firebase/auth-types").UserCredential>;
    verificationId: string;
};
