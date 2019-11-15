// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import { Mock } from "../src";

const expect = chai.expect;
describe("Firebase Auth's EmailAuthProvider =>", () => {
  it("EmailAuthProvider exists and has appropriate props", async () => {
    const m = await Mock.prepare();
    expect(m.authProviders).to.be.an("object");
    expect(m.authProviders.EmailAuthProvider.credential).to.be.a("function");
  });
});
