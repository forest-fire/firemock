import { IMockAuthConfig, User, IEmailUser } from "./types";
export declare type Observer = (user: User | null) => any;
export declare type IMockAdminApi = typeof authAdminApi;
export declare const authAdminApi: {
    configureAuth(config: IMockAuthConfig): void;
    getValidEmailUsers(): IEmailUser[];
    getAuthConfig(): IMockAuthConfig;
    addUserToAuth(u: import("@firebase/auth-types").User, p: string): void;
    updateEmailUser(email: string, updates: Partial<IEmailUser>): void;
    /**
     * For an already existing user in the Auth user pool, allows
     * the addition of _custom claims_.
     */
    grantUserCustomClaims(email: string, claims: string[]): void;
    /**
     * State explicitly what UID an anonymous user
     * should get; if not stated the default is to
     * generate a random UID.
     */
    setAnonymousUser(uid: string): import("./types").IMockAuth;
    /**
     * Gets a UID for an anonymous user; this UID will
     * be randomly generated unless it has been set
     * statically with the `setAnonymousUser()` method
     */
    getAnonymousUid(): string;
    /**
     * Retrieve the currently logged in user
     */
    getCurrentUser(): import("@firebase/auth-types").User;
    /**
     * Set the current user to a new user and notify all
     * observers of the `onAuth` event
     *
     * @param u the new `User` who has logged in
     */
    login(u: import("@firebase/auth-types").User): void;
    /**
     * Clear the current user and notify all observers of the
     * `onAuth` event.
     */
    logout(): void;
    /**
     * Add a callback function to be notified when Auth events
     * take place.
     *
     * @param observer callback function for `onAuth` events
     */
    addAuthObserver(observer: (user: import("@firebase/auth-types").User) => any): void;
    /**
     * Get a list of all the callback observers which have registered
     */
    getAuthObservers(): Observer[];
};
