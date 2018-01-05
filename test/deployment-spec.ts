// tslint:disable:no-implicit-dependencies
import "mocha";
import { IDictionary } from "common-types";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
// tslint:disable-next-line
import { length } from "./testing/helpers";
import Mock, { SchemaCallback } from "../src/mock";
import SchemaHelper from "../src/schema-helper";
import first = require("lodash.first");
import last = require("lodash.last");

const expect = chai.expect;

describe("Deployment", () => {
  const animalMock: SchemaCallback = h => () => ({
    name: h.faker.name.firstName(),
    age: h.faker.helpers.randomize([1, 2, 4]),
    home: h.chance.address()
  });

  it("Overriding the mock at deployment works", async () => {
    const m = new Mock();
    m.addSchema("animal", animalMock);
    m.queueSchema("animal", 10);
    m.queueSchema("animal", 10, { age: 12 });
    m.generate();

    const results = await m.ref("/animals").once("value");
    const filtered = await m
      .ref("/animals")
      .orderByChild("age")
      .equalTo(12, "age")
      .once("value");

    expect(results.numChildren()).to.equal(20);
    expect(filtered.numChildren()).to.equal(10);
  });

  it("using modelName() changes path in DB", () => {
    const m = new Mock();
    m.addSchema("cat", animalMock);
    m.addSchema("dog", animalMock).modelName("animal");
    m.queueSchema("cat", 10);
    m.queueSchema("dog", 10);
    m.generate();
    expect(length(m.db.cats)).to.equal(10);
    expect(length(m.db.dogs)).to.equal(0);
    expect(length(m.db.animals)).to.equal(10);
  });

  it("offset property is incorporated into DB path", () => {
    const m = new Mock();
    m
      .addSchema("cat", animalMock)
      .modelName("animal")
      .pathPrefix("auth/anonymous");

    m
      .addSchema("dog", animalMock)
      .modelName("animal")
      .pathPrefix("auth/anonymous/");
    m.queueSchema("cat", 10, { kind: "cat" });
    m.queueSchema("dog", 10, { kind: "dog" });
    m.generate();

    expect(length(m.db.dogs)).to.equal(0);
    expect(length(m.db.cats)).to.equal(0);
    expect(length(m.db.animals)).to.equal(0);
    expect(length(m.db.auth)).to.equal(1);
    expect(length(m.db.auth.anonymous)).to.equal(1);
    expect(length(m.db.auth.anonymous.animals)).to.equal(20);
  });
});
