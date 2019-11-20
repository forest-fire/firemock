// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import { Mock } from "../src";

const expect = chai.expect;
describe("EmailAuthProvider =>", () => {
  it("EmailAuthProvider exists and has appropriate props", async () => {
    const m = new Mock();
    expect(m.authProviders).to.be.an("object");
    expect(m.authProviders.EmailAuthProvider.credential).to.be.a("function");
  });

  it("calling credential() gives back a valid AuthCredential", () => {
    const m = new Mock();
    const provider = m.authProviders.EmailAuthProvider;
    const response = provider.credential(
      "me@somewhere.com",
      "i'm a little teacup"
    );
    expect(response).to.be.a("object");
    expect(response.providerId).to.be.a("string");
    expect(response.signInMethod).to.equal("email-and-password");
    expect(response.toJSON).to.be.a("function");
  });
});
