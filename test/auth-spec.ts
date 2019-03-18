// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import { length } from "./testing/helpers";
import Mock, { SchemaCallback } from "../src/mock";

const expect = chai.expect;

describe("Firebase Auth →", () => {
  it("Calling auth() gives you API", async () => {
    const m = new Mock();
    const auth = await m.auth();
    expect(auth).to.haveOwnProperty("signInAnonymously");
    expect(auth).to.haveOwnProperty("signInWithEmailAndPassword");
    expect(auth).to.haveOwnProperty("createUserWithEmailAndPassword");
  });

  it("Signing in anonymously is defaulted to true", async () => {
    const m = new Mock();
    const auth = await m.auth();
  });

  it("signInAnonymously returns uid of default anonymous user", async () => {
    const m = new Mock();
    const auth = await m.auth();
    const user = await auth.signInAnonymously();
    expect(user.user.uid).to.equal(auth.get);
  });
});
