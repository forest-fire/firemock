import { IDictionary } from "common-types";
import { Auth } from "../../../@types/auth-types";

export const claims: Partial<Auth> = {
  /**
   * Sets additional developer claims on an existing user identified by the provided uid,
   * typically used to define user roles and levels of access.
   */
  async setCustomUserClaims(
    uid: string,
    customUserClaims: IDictionary | null
  ): Promise<void> {
    //
  }
};
