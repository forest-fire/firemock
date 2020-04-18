// tslint:disable:no-implicit-dependencies
import "mocha";
import { IDictionary } from "common-types";
import * as chai from "chai";
import { SnapShot } from "../src/rtdb";
const expect = chai.expect;

describe("SnapShot:", () => {
  it("a snapshot key property only returns last part of path", () => {
    const s = new SnapShot("people/-Keyre2234as", { name: "foobar" });
    expect(s.key).to.equal("-Keyre2234as");
  });
});
