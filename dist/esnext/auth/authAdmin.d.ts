import { IAuthConfig, IEmailLogin } from "./types";
export declare type IMockAdminApi = typeof authAdminApi;
export declare const authAdminApi: {
    configureAuth(config: IAuthConfig): void;
    getValidEmails(): IEmailLogin[];
    getAuthConfig(): IAuthConfig;
    setAnonymousUser(uid: string): import("./types").IMockAuth;
    getAnonymousUid(): string;
};
