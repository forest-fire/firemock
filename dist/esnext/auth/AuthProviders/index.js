import { Auth } from "./Auth";
import { EmailAuthProvider } from "./EmailAuthProvider";
import { EmailAuthProvider_Instance } from "./EmailAuthProvider_Instance";
import { FacebookAuthProvider } from "./FacebookAuthProvider";
import { FacebookAuthProvider_Instance } from "./FacebookAuthProvider_Instance";
import { GithubAuthProvider } from "./GithubAuthProvider";
import { GithubAuthProvider_Instance } from "./GithubAuthProvider_Instance";
import { GoogleAuthProvider } from "./GoogleAuthProvider";
import { GoogleAuthProvider_Instance } from "./GoogleAuthProvider_Instance";
import { TwitterAuthProvider } from "./TwitterAuthProvider";
import { TwitterAuthProvider_Instance } from "./TwitterAuthProvider_Instance";
import { SAMLAuthProvider } from "./SAMLAuthProvider";
import { OAuthProvider } from "./OAuthProvider";
import { PhoneAuthProvider } from "./PhoneAuthProvider";
import { PhoneAuthProvider_Instance } from "./PhoneAuthProvider_Instance";
import { RecaptchaVerifier } from "./RecaptchaVerifier";
import { RecaptchaVerifier_Instance } from "./RecaptchaVerifier_Instance";
// tslint:disable-next-line: no-object-literal-type-assertion
const api = {
    Auth: Auth,
    EmailAuthProvider,
    EmailAuthProvider_Instance,
    FacebookAuthProvider,
    FacebookAuthProvider_Instance,
    GithubAuthProvider,
    GithubAuthProvider_Instance,
    GoogleAuthProvider,
    GoogleAuthProvider_Instance,
    TwitterAuthProvider,
    TwitterAuthProvider_Instance,
    SAMLAuthProvider,
    OAuthProvider,
    PhoneAuthProvider,
    PhoneAuthProvider_Instance,
    RecaptchaVerifier,
    RecaptchaVerifier_Instance
};
const fn = () => {
    throw new Error("not allowed");
};
export default (api || fn);
//# sourceMappingURL=index.js.map