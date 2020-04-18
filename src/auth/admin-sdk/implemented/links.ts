import { ActionCodeSettings } from "@firebase/auth-types";
import { Auth } from "../../../@types/auth-types";

export const links: Partial<Auth> = {
  // https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth#generate-email-verification-link
  async generateEmailVerificationLink(
    email: string,
    actionCodeSetting?: ActionCodeSettings
  ): Promise<string> {
    return "";
  }
};
