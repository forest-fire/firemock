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
// tslint:disable-next-line: no-object-literal-type-assertion
const api = {
    Auth: Auth,
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
const fn = () => {
    throw new Error("not allowed");
};
export default (api || fn);
//# sourceMappingURL=index.js.map