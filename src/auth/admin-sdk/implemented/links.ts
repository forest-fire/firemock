import { Auth, ActionCodeSettings } from "../index";

export const links: Partial<Auth> = {
  // https://firebase.google.com/docs/reference/admin/node/admin.auth.Auth#generate-email-verification-link
  async generateEmailVerificationLink(
    email: string,
    actionCodeSetting?: ActionCodeSettings
  ): Promise<string> {
    return "";
  }
};
