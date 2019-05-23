import { IMockAuthConfig, IEmailLogin, User } from "./types";
export declare type Observer = (user: User | null) => any;
export declare type IMockAdminApi = typeof authAdminApi;
export declare const authAdminApi: {
    configureAuth(config: IMockAuthConfig): void;
    getValidEmails(): IEmailLogin[];
    getAuthConfig(): IMockAuthConfig;
    setAnonymousUser(uid: string): import("./types").IMockAuth;
    getAnonymousUid(): string;
    addAuthObserver(observer: (user: import("@firebase/auth-types").User) => any): void;
    getAuthObservers(): Observer[];
};
