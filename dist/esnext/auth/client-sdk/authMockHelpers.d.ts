import { User } from "@firebase/auth-types";
export declare function emailExistsAsUserInAuth(email: string): boolean;
export declare function emailIsValidFormat(email: string): boolean;
export declare function emailHasCorrectPassword(email: string, password: string): boolean;
export declare function emailVerified(email: string): boolean;
export declare function userUid(email: string): string;
export declare function emailValidationAllowed(): boolean;
export declare function loggedIn(user: User): void;
export declare function loggedOut(): void;
