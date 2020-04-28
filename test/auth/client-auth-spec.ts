// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import { Mock } from "../../src/mocking";
import {
  authProviders,
  setCurrentUser,
  setDefaultAnonymousUid,
  addAuthObserver
} from "../../src/auth/state-mgmt";

const expect = chai.expect;

describe("Firebase Auth →", () => {
  it("Calling auth() gives you API", async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    expect(auth).to.haveOwnProperty("signInAnonymously");
    expect(auth).to.haveOwnProperty("signInWithEmailAndPassword");
    expect(auth).to.haveOwnProperty("createUserWithEmailAndPassword");
  });

  it("Signing in anonymously is defaulted to true", async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    expect(authProviders().includes("anonymous")).to.equal(true);
  });

  it("Signing in with email is defaulted to false", async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    expect(authProviders().includes("emailPassword")).to.equal(false);
  });

  it("signInAnonymously returns uid of default anonymous user (when set)", async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    setDefaultAnonymousUid("1234");
    const user = await auth.signInAnonymously();

    expect(user.user.uid).to.equal("1234");
  });

  it("signInWithEmail with valid email returns a valid user", async () => {
    const m = await Mock.prepare({
      auth: {
        users: [
          { email: "test@test.com", password: "foobar", emailVerified: true }
        ],
        providers: ["emailPassword"]
      }
    });
    const auth = await m.auth();
    const user = await auth.signInWithEmailAndPassword(
      "test@test.com",
      "foobar"
    );
    expect(user.user.email)
      .to.be.a("string")
      .and.to.equal("test@test.com");
    expect(user.user.emailVerified).to.equal(true);
  });

  it("signInWithEmail with valid email but invalid password fails", async () => {
    const m = await Mock.prepare({
      auth: {
        users: [
          { email: "test@test.com", password: "foobar", emailVerified: true }
        ],
        providers: ["emailPassword"]
      }
    });
    const auth = await m.auth();
    try {
      const user = await auth.signInWithEmailAndPassword(
        "test@test.com",
        "bad-password"
      );
      throw new Error("Login attempt should have failed with error!");
    } catch (e) {
      expect(e.name).is.equal("auth/wrong-password");
      expect(e.code).is.equal("wrong-password");
    }
  });

  it("createUserWithEmailAndPassword created unverified user", async () => {
    const m = await Mock.prepare({
      auth: {
        providers: ["emailPassword"],
        users: []
      }
    });
    const { userCredential } = await createUser(m, "test@test.com", "password");
    expect(userCredential.user.email).to.equal("test@test.com");
    expect(userCredential.user.emailVerified).to.equal(false);
  });

  it("once user is created, it can be used to login with", async () => {
    const m = await Mock.prepare({
      auth: {
        providers: ["emailPassword"],
        users: []
      }
    });
    const { auth } = await createUser(m, "test@test.com", "password");
    const userCredentials = await auth.signInWithEmailAndPassword(
      "test@test.com",
      "password"
    );
    expect(userCredentials.user.email).to.equal("test@test.com");
  });

  it("userCredential passed back from creation allows password reset", async () => {
    const m = await Mock.prepare({
      auth: {
        providers: ["emailPassword"],
        users: []
      }
    });
    const { userCredential, auth } = await createUser(
      m,
      "test@test.com",
      "password"
    );
    setCurrentUser(userCredential);
    expect(userCredential.user.updatePassword).to.be.a("function");

    await userCredential.user.updatePassword("foobar");
    await auth.signInWithEmailAndPassword("test@test.com", "foobar");
  });

  it("calls to getIdToken() respond with value configured when available", async () => {
    const expectedToken = "123456789";
    const m = await Mock.prepare({
      auth: {
        providers: ["emailPassword"],
        users: [
          {
            email: "test@company.com",
            password: "foobar",
            tokenIds: [expectedToken]
          }
        ]
      }
    });

    const auth = await m.auth();
    const user = await auth.signInWithEmailAndPassword(
      "test@company.com",
      "foobar"
    );
    const token = await user.user.getIdToken();

    expect(token).to.equal(expectedToken);
  });

  it("signInWithEmailAndPassword should notify authObservers", async () => {
   const user = { email: "test@test.com", password: "foobar" };;
    const m = await Mock.prepare({
      auth: {
        providers: ["emailPassword"],
        users: [user]
      }
    });

    const auth = await m.auth();

    let hasBeenNotified = false;
    addAuthObserver(() => hasBeenNotified = true);
    await auth.signInWithEmailAndPassword(user.email, user.password);

    expect(hasBeenNotified).is.equal(true);
  });

  it("signOut should notify authObservers", async () => {
    const user = {email: "test@test.com", password: "foobar"};
    const m = await Mock.prepare({
      auth: {
        providers: ["emailPassword"],
        users: [user]
      }
    });

    const auth = await m.auth();

    let hasBeenNotified = false;
    addAuthObserver(() => hasBeenNotified = true);
    await auth.signOut();

    expect(hasBeenNotified).is.equal(true);
  });
});

async function createUser(mock: Mock, email: string, password: string) {
  const auth = await mock.auth();
  const userCredential = await auth.createUserWithEmailAndPassword(
    email,
    password
  );
  return { auth, userCredential };
}
