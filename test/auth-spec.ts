// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import { length } from "./testing/helpers";
import { Mock, SchemaCallback } from "../src";

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

  it("signInAnonymously returns uid of default anonymous user", async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    const user = await auth.signInAnonymously();
    expect(user.user.uid).to.equal(auth.getAnonymousUid());
  });

  it("signInWithEmail with valid email returns a valid user", async () => {
    const m = await Mock.prepare({
      auth: {
        allowEmailLogins: true,
        validEmailLogins: [{ email: "test@test.com", password: "foobar", verified: true }]
      }
    });
    const auth = await m.auth();
    const user = await auth.signInWithEmailAndPassword("test@test.com", "foobar");
    expect(user.user.email)
      .to.be.a("string")
      .and.to.equal("test@test.com");
    expect(user.user.emailVerified).to.equal(true);
  });
});
