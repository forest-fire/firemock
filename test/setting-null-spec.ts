// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import { Mock, SchemaCallback } from "../src";
const expect = chai.expect;

const animalMock: SchemaCallback = h => () => ({
  name: h.faker.name.firstName(),
  age: h.faker.helpers.randomize([1, 2, 4]),
  home: h.faker.address.streetAddress()
});

describe("Setting null to db path →", () => {
  it("when set() to null path should be removed", async () => {
    const m = await Mock.prepare();
    m.addSchema("animal", animalMock);
    m.queueSchema("animal", 1, { id: "1234" });
    m.queueSchema("animal", 2, { age: 12 });
    m.queueSchema("animal", 2, { age: 16 });
    m.generate();
    const results = await m.ref("/animals").once("value");

    expect(results.numChildren()).to.equal(5);
    await m.ref("/animals/1234").set(null);
    const results2 = await m.ref("/animals").once("value");
    expect(results2.numChildren()).to.equal(4);
  });
});
