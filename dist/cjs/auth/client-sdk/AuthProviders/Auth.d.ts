import { Persistence } from "@firebase/auth-types";
export declare class Auth {
    static Persistence: {
        LOCAL: Persistence;
        NONE: Persistence;
        SESSION: Persistence;
    };
    constructor();
}
