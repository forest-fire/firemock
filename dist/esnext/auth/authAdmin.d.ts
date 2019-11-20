import { IMockAuthConfig } from "../@types/config-types";
import { User } from "@firebase/auth-types";
import { IEmailUser } from "../@types/auth-types";
export declare function clearAuthUsers(): void;
export declare type Observer = (user: User | null) => any;
export declare type IMockAdminApi = typeof authAdminApi;
export declare const authAdminApi: {
    /**
     * Updates the Auth configuration
     *
     * @param config the new config parameters passed in
     */
    configureAuth(config: IMockAuthConfig): void;
    getValidEmailUsers(): IEmailUser[];
    getAuthConfig(): IMockAuthConfig;
    addUserToAuth(u: User, p: string): void;
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
     *
     * **Note:** this is a administrative admin function
     * and _not_ a part of the Firebase API.
     */
    setAnonymousUid(uid: string): import("../@types/auth-types").IMockAuth;
    /**
     * Gets a UID for an anonymous user; this UID will
     * be randomly generated unless it has been set
     * statically with the `setAnonymousUid()` method
     */
    getAnonymousUid(): string;
    /**
     * Retrieve the currently logged in user
     */
    getCurrentUser(): User;
    /**
     * Set the current user to a new user and notify all
     * observers of the `onAuth` event
     *
     * @param u the new `User` who has logged in
     */
    login(u: User): void;
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
    addAuthObserver(observer: (user: User) => any): void;
    /**
     * Get a list of all the callback observers which have registered
     */
    getAuthObservers(): Observer[];
};
