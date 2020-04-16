import { IMockUser, IMockAuthConfig, ISimplifiedMockUser } from "../../@types";
import { UserCredential, User } from "@firebase/auth-types";
import { UpdateRequest } from "../admin-sdk";
export declare type IAuthObserver = (user: User | null) => any;
export declare function getAuthObservers(): IAuthObserver[];
export declare function addAuthObserver(ob: IAuthObserver): void;
export declare function initializeAuth(config: IMockAuthConfig): void;
/** sets the current user based on a given `UserCredential` */
export declare function setCurrentUser(user: User | UserCredential): void;
/**
 * Returns the `IMockUser` record for the currently logged in user
 */
export declare function currentUser(): IMockUser;
/**
 * Returns the full `UserCredential` object for the logged in user;
 * this is only relevant for client sdk.
 */
export declare function currentUserCredential(): UserCredential;
/**
 * Clears the `currentUser` and `currentUserCredential` as would be
 * typical of what happens at the point a user is logged out.
 */
export declare function clearCurrentUser(): void;
/**
 * Clears all known mock users
 */
export declare function clearAuthUsers(): void;
export declare function setDefaultAnonymousUid(uid: string): void;
export declare function getAnonymousUid(): string;
export declare function addUser(user: ISimplifiedMockUser | User): void;
export declare function getUserById(uid: string): IMockUser;
export declare function getUserByEmail(email: string): IMockUser;
/**
 * Converts the basic properties provided by a
 * `IMockUser` definition into a full fledged `User` object
 * which is a superset including methods such as `updateEmail`,
 * `updatePassword`, etc. For more info refer to docs on `User`:
 *
 * [User Docs](https://firebase.google.com/docs/reference/js/firebase.User)
 *
 * @param user a mock user defined by `IMockUser`
 */
export declare function convertToFirebaseUser(user: IMockUser): User;
export declare function updateUser(uid: string, update: Partial<IMockUser> | UpdateRequest): void;
export declare function allUsers(): IMockUser[];
export declare function removeUser(uid: string): void;
export declare function authProviders(): ("emailPassword" | "phone" | "google" | "playGames" | "gameCenter" | "facebook" | "twitter" | "github" | "yahoo" | "microsoft" | "apple" | "anonymous")[];
export declare function getRandomMockUid(): string;
