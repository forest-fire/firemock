import { FirebaseNamespace, FirebaseApp } from "@firebase/app-types";
import { Auth } from "./Auth";
import { EmailAuthProvider } from "./EmailAuthProvider";
import { FacebookAuthProvider } from "./FacebookAuthProvider";
import { GithubAuthProvider } from "./GithubAuthProvider";
import { GoogleAuthProvider } from "./GoogleAuthProvider";
import { TwitterAuthProvider } from "./TwitterAuthProvider";
import { SAMLAuthProvider } from "./SAMLAuthProvider";
import { OAuthProvider } from "./OAuthProvider";
import { PhoneAuthProvider } from "./PhoneAuthProvider";
import { RecaptchaVerifier } from "./RecaptchaVerifier";
import { FirebaseAuth } from "@firebase/auth-types";

// tslint:disable-next-line: no-object-literal-type-assertion
const api: Partial<FirebaseNamespace["auth"]> = {
  Auth: Auth as any,
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  SAMLAuthProvider,
  OAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier
};

const fn = (): FirebaseAuth => {
  throw new Error("not allowed");
};

export default (api || fn) as FirebaseNamespace["auth"];
