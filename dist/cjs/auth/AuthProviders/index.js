"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = require("./Auth");
const EmailAuthProvider_1 = require("./EmailAuthProvider");
const EmailAuthProvider_Instance_1 = require("./EmailAuthProvider_Instance");
const FacebookAuthProvider_1 = require("./FacebookAuthProvider");
const FacebookAuthProvider_Instance_1 = require("./FacebookAuthProvider_Instance");
const GithubAuthProvider_1 = require("./GithubAuthProvider");
const GithubAuthProvider_Instance_1 = require("./GithubAuthProvider_Instance");
const GoogleAuthProvider_1 = require("./GoogleAuthProvider");
const GoogleAuthProvider_Instance_1 = require("./GoogleAuthProvider_Instance");
const TwitterAuthProvider_1 = require("./TwitterAuthProvider");
const TwitterAuthProvider_Instance_1 = require("./TwitterAuthProvider_Instance");
const SAMLAuthProvider_1 = require("./SAMLAuthProvider");
const OAuthProvider_1 = require("./OAuthProvider");
const PhoneAuthProvider_1 = require("./PhoneAuthProvider");
const PhoneAuthProvider_Instance_1 = require("./PhoneAuthProvider_Instance");
const RecaptchaVerifier_1 = require("./RecaptchaVerifier");
const RecaptchaVerifier_Instance_1 = require("./RecaptchaVerifier_Instance");
// tslint:disable-next-line: no-object-literal-type-assertion
const api = {
    Auth: Auth_1.Auth,
    EmailAuthProvider: EmailAuthProvider_1.EmailAuthProvider,
    EmailAuthProvider_Instance: EmailAuthProvider_Instance_1.EmailAuthProvider_Instance,
    FacebookAuthProvider: FacebookAuthProvider_1.FacebookAuthProvider,
    FacebookAuthProvider_Instance: FacebookAuthProvider_Instance_1.FacebookAuthProvider_Instance,
    GithubAuthProvider: GithubAuthProvider_1.GithubAuthProvider,
    GithubAuthProvider_Instance: GithubAuthProvider_Instance_1.GithubAuthProvider_Instance,
    GoogleAuthProvider: GoogleAuthProvider_1.GoogleAuthProvider,
    GoogleAuthProvider_Instance: GoogleAuthProvider_Instance_1.GoogleAuthProvider_Instance,
    TwitterAuthProvider: TwitterAuthProvider_1.TwitterAuthProvider,
    TwitterAuthProvider_Instance: TwitterAuthProvider_Instance_1.TwitterAuthProvider_Instance,
    SAMLAuthProvider: SAMLAuthProvider_1.SAMLAuthProvider,
    OAuthProvider: OAuthProvider_1.OAuthProvider,
    PhoneAuthProvider: PhoneAuthProvider_1.PhoneAuthProvider,
    PhoneAuthProvider_Instance: PhoneAuthProvider_Instance_1.PhoneAuthProvider_Instance,
    RecaptchaVerifier: RecaptchaVerifier_1.RecaptchaVerifier,
    RecaptchaVerifier_Instance: RecaptchaVerifier_Instance_1.RecaptchaVerifier_Instance
};
const fn = () => {
    throw new Error("not allowed");
};
exports.default = (api || fn);
//# sourceMappingURL=index.js.map