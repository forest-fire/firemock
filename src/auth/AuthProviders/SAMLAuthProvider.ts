import { SAMLAuthProvider as GoogleSAMLAuthProvider } from "@firebase/auth-types";

export class SAMLAuthProvider implements GoogleSAMLAuthProvider {
  public providerId: string;
}
