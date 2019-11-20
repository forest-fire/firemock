"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = require("./Auth");
const EmailAuthProvider_1 = require("./EmailAuthProvider");
const FacebookAuthProvider_1 = require("./FacebookAuthProvider");
const GithubAuthProvider_1 = require("./GithubAuthProvider");
const GoogleAuthProvider_1 = require("./GoogleAuthProvider");
const TwitterAuthProvider_1 = require("./TwitterAuthProvider");
const SAMLAuthProvider_1 = require("./SAMLAuthProvider");
const OAuthProvider_1 = require("./OAuthProvider");
const PhoneAuthProvider_1 = require("./PhoneAuthProvider");
const RecaptchaVerifier_1 = require("./RecaptchaVerifier");
// tslint:disable-next-line: no-object-literal-type-assertion
const api = {
    Auth: Auth_1.Auth,
    EmailAuthProvider: EmailAuthProvider_1.EmailAuthProvider,
    FacebookAuthProvider: FacebookAuthProvider_1.FacebookAuthProvider,
    GithubAuthProvider: GithubAuthProvider_1.GithubAuthProvider,
    GoogleAuthProvider: GoogleAuthProvider_1.GoogleAuthProvider,
    TwitterAuthProvider: TwitterAuthProvider_1.TwitterAuthProvider,
    SAMLAuthProvider: SAMLAuthProvider_1.SAMLAuthProvider,
    OAuthProvider: OAuthProvider_1.OAuthProvider,
    PhoneAuthProvider: PhoneAuthProvider_1.PhoneAuthProvider,
    RecaptchaVerifier: RecaptchaVerifier_1.RecaptchaVerifier
};
const fn = () => {
    throw new Error("not allowed");
};
exports.default = (api || fn);
//# sourceMappingURL=index.js.map