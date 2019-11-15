import { Persistence } from "@firebase/auth-types";

export class Auth {
  public static Persistence: {
    LOCAL: Persistence;
    NONE: Persistence;
    SESSION: Persistence;
  };

  constructor() {
    throw new Error(
      "You should not call this constructor directly! Instead use the auth() accessor to get to this API."
    );
  }
}
