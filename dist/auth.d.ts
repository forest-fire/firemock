declare type User = import("@firebase/auth-types").User;
declare type AuthCredential = import("@firebase/auth-types").AuthCredential;
declare type AdditionalUserInfo = import("@firebase/auth-types").AdditionalUserInfo;
export interface IEmailLogin {
    email: string;
    password: string;
}
export interface IAuthConfig {
    validEmailLogins?: IEmailLogin[];
    allowAnonymous?: boolean;
    allowEmailLogins?: boolean;
    allowEmailLinks?: boolean;
    allowPhoneLogins?: boolean;
}
export interface IPartialUserCredential {
    additionalUserInfo?: Partial<AdditionalUserInfo> | null;
    credential: Partial<AuthCredential> | null;
    operationType?: string | null;
    user: Partial<User> | null;
}
export declare function configureAuth(config?: IAuthConfig): void;
declare const authApi: {
    signInAnonymously: () => Promise<IPartialUserCredential>;
    signInWithEmailAndPassword(email: string, password: string): Promise<{
        user: {
            email: string;
            uid: string;
        };
    }>;
    createUserWithEmailAndPassword(email: string, password: string): Promise<void>;
    sendPasswordReset(): Promise<void>;
    confirmPasswordReset(): Promise<void>;
    signOut(): Promise<void>;
};
declare const auth: () => Promise<{
    signInAnonymously: () => Promise<IPartialUserCredential>;
    signInWithEmailAndPassword(email: string, password: string): Promise<{
        user: {
            email: string;
            uid: string;
        };
    }>;
    createUserWithEmailAndPassword(email: string, password: string): Promise<void>;
    sendPasswordReset(): Promise<void>;
    confirmPasswordReset(): Promise<void>;
    signOut(): Promise<void>;
}>;
export { auth, authApi };
