// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import { Mock } from "../src";

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
    expect(auth.getAuthConfig().allowAnonymous).to.equal(true);
  });

  it("Signing in with email is defaulted to false", async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    expect(auth.getAuthConfig().allowEmailLogins).to.equal(false);
  });

  it("signInAnonymously returns uid of default anonymous user (when set)", async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    auth.setAnonymousUid("1234");
    const user = await auth.signInAnonymously();
    expect(user.user.uid).to.equal("1234");
  });

  it("signInWithEmail with valid email returns a valid user", async () => {
    const m = await Mock.prepare({
      auth: {
        allowEmailLogins: true,
        validEmailUsers: [
          { email: "test@test.com", password: "foobar", verified: true }
        ]
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
        allowEmailLogins: true,
        validEmailUsers: [
          { email: "test@test.com", password: "foobar", verified: true }
        ]
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
        allowEmailLogins: true,
        validEmailUsers: []
      }
    });
    const { userCredential } = await createUser(m, "test@test.com", "password");
    expect(userCredential.user.email).to.equal("test@test.com");
    expect(userCredential.user.emailVerified).to.equal(false);
  });

  it("once user is created, it can be used to login with", async () => {
    const m = await Mock.prepare({
      auth: {
        allowEmailLogins: true,
        validEmailUsers: []
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
        allowEmailLogins: true,
        validEmailUsers: []
      }
    });
    const { userCredential, auth } = await createUser(
      m,
      "test@test.com",
      "password"
    );
    expect(userCredential.user.updatePassword).to.be.a("function");
    await userCredential.user.updatePassword("foobar");
    await auth.signInWithEmailAndPassword("test@test.com", "foobar");
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
