import { IMockAuthConfig, IEmailLogin } from "./types";
export declare type IMockAdminApi = typeof authAdminApi;
export declare const authAdminApi: {
    configureAuth(config: IMockAuthConfig): void;
    getValidEmails(): IEmailLogin[];
    getAuthConfig(): IMockAuthConfig;
    setAnonymousUser(uid: string): import("./types").IMockAuth;
    getAnonymousUid(): string;
};
