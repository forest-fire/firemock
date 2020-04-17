import { networkDelay } from "../../shared/util";
import { completeUserCredential } from "./completeUserCredential";
import { FireMockError } from "../../errors/FireMockError";
import { emailExistsAsUserInAuth, emailHasCorrectPassword, emailVerified, userUid, emailValidationAllowed, emailIsValidFormat } from "./authMockHelpers";
import { addUser, allUsers, authProviders, setCurrentUser, clearCurrentUser, addAuthObserver, getAnonymousUid } from "../state-mgmt";
import { clientApiUser } from "./UserObject";
export const implemented = {
    app: {
        name: "mocked-app",
        options: {},
        async delete() {
            return;
        },
        automaticDataCollectionEnabled: false
    },
    onAuthStateChanged(observer) {
        addAuthObserver(observer);
    },
    async setPersistence() {
        console.warn(`currently firemock accepts calls to setPersistence() but it doesn't support it.`);
    },
    signInAnonymously: async () => {
        await networkDelay();
        if (authProviders().includes("anonymous")) {
            const user = Object.assign(Object.assign({}, clientApiUser), { isAnonymous: true, uid: getAnonymousUid() });
            const credential = {
                signInMethod: "anonymous",
                providerId: "anonymous",
                toJSON: () => "" // recently added
            };
            const credentials = {
                user,
                credential
            };
            const userCredential = completeUserCredential(credentials);
            addUser(userCredential.user);
            setCurrentUser(userCredential);
            return userCredential;
        }
        else {
            throw new FireMockError("you must enable anonymous auth in the Firebase Console", "auth/operation-not-allowed");
        }
    },
    async signInWithEmailAndPassword(email, password) {
        await networkDelay();
        if (!emailValidationAllowed()) {
            throw new FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (!emailIsValidFormat(email)) {
            throw new FireMockError(`invalid email: ${email}`, "auth/invalid-email");
        }
        const found = allUsers().find(i => i.email === email);
        if (!found) {
            throw new FireMockError(`The email "${email}" was not found`, `auth/user-not-found`);
        }
        if (!emailHasCorrectPassword(email, password)) {
            throw new FireMockError(`Invalid password for ${email}`, "auth/wrong-password");
        }
        const partial = {
            user: {
                email: found.email,
                isAnonymous: false,
                emailVerified: emailVerified(email),
                uid: userUid(email)
            },
            credential: {
                signInMethod: "signInWithEmailAndPassword",
                providerId: ""
            },
            additionalUserInfo: {
                username: email
            }
        };
        const u = completeUserCredential(partial);
        setCurrentUser(u);
        return u;
    },
    /**
     * Add a new user with the Email/Password provider
     */
    async createUserWithEmailAndPassword(email, password) {
        await networkDelay();
        if (!emailValidationAllowed()) {
            throw new FireMockError("email authentication not allowed", "auth/operation-not-allowed");
        }
        if (emailExistsAsUserInAuth(email)) {
            throw new FireMockError(`"${email}" user already exists`, "auth/email-already-in-use");
        }
        if (!emailIsValidFormat(email)) {
            throw new FireMockError(`"${email}" is not a valid email format`, "auth/invalid-email");
        }
        const partial = {
            user: {
                email,
                isAnonymous: false,
                emailVerified: false,
                uid: userUid(email)
            },
            credential: {
                signInMethod: "signInWithEmailAndPassword",
                providerId: ""
            },
            additionalUserInfo: {
                username: email
            }
        };
        const u = completeUserCredential(partial);
        addUser({ uid: partial.user.uid, email, password });
        setCurrentUser(u);
        return u;
    },
    async confirmPasswordReset(code, newPassword) {
        return;
    },
    async sendPasswordResetEmail(email, actionCodeSetting) {
        return;
    },
    async signOut() {
        clearCurrentUser();
    },
    get currentUser() {
        return completeUserCredential({}).user;
    },
    languageCode: "",
    async updateCurrentUser() {
        return;
    },
    settings: {
        appVerificationDisabledForTesting: false
    }
};
//# sourceMappingURL=implemented.js.map