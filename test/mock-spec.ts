// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
import { SchemaCallback } from "../src";
import { Mock, SchemaHelper } from "../src/mocking";
import first from "lodash.first";
import { firstProp, lastProp } from "../src/shared/util";

const expect = chai.expect;

const employeeMocker: SchemaCallback = (h: SchemaHelper) => () => ({
  first: h.faker.name.firstName(),
  last: h.faker.name.lastName(),
  company: h.faker.company.companyName()
});

describe("Mock class()", () => {
  it.skip("using Mock without prepare() does not provide faker support at onset", async () => {
    const m = new Mock();
    // this is unreliable; it may or may not be resolved
    expect(m.faker).is.a("undefined");
  });

  it("using Mock.prepare() initializer returns immediate use of faker library", async () => {
    const m = await Mock.prepare();
    expect(m.faker).is.a("object");
    expect(m.faker.address.city).is.a("function");
  });

  it("Mock a Schema API structured correctly", async () => {
    const m = await Mock.prepare();
    const schemaApi = m.addSchema("foo");
    expect(schemaApi.mock).is.a("function");
    expect(schemaApi.belongsTo).is.a("function");
    expect(schemaApi.hasMany).is.a("function");
    expect(schemaApi.pluralName).is.a("function");
    // expect(schemaApi.databasePrefix).is.a('function');
  });

  it("Mock → Deployment API structured correctly", async () => {
    const m = await Mock.prepare();
    m.addSchema("foo").mock((h: SchemaHelper) => () => "testing");
    const deployApi = m.deploy.queueSchema("foo");

    expect(deployApi.queueSchema).is.a("function");
    expect(deployApi.quantifyHasMany).is.a("function");
    expect(deployApi.fulfillBelongsTo).is.a("function");
    expect(deployApi.generate).is.a("function");
  });

  describe("Building and basic config of database", () => {
    it("Sending in raw data to constructor allows manual setting of database state", async () => {
      const m = await Mock.prepare({
        db: {
          monkeys: {
            a: { name: "abbey" },
            b: { name: "bobby" },
            c: { name: "cindy" }
          }
        }
      });

      expect(m.db.monkeys).to.be.an("object");
      expect(m.db.monkeys.a.name).to.equal("abbey");
      const result = await m.ref("/monkeys").once("value");
      expect(result.numChildren()).to.equal(3);
    });

    it("Adding a call to updateDB() allows additional state in conjunction with API additions", async () => {
      const m = await Mock.prepare();
      m.addSchema("owner").mock(h => () => ({
        name: h.faker.name.firstName()
      }));
      m.deploy.queueSchema("owner", 10).generate();

      m.updateDB({
        monkeys: {
          a: { name: "abbey" },
          b: { name: "bobby" },
          c: { name: "cindy" }
        }
      });

      expect(m.db.monkeys).to.be.an("object");
      expect(m.db.owners).to.be.an("object");
      expect(m.db.monkeys.a.name).to.equal("abbey");
      const monkeys = await m.ref("/monkeys").once("value");
      expect(monkeys.numChildren()).to.equal(3);

      const owners = await m.ref("/owners").once("value");
      expect(owners.numChildren()).to.equal(10);
    });

    it("Simple mock-to-generate populates DB correctly", async () => {
      const m = await Mock.prepare();
      m.addSchema("foo").mock((h: SchemaHelper) => () => {
        return {
          first: h.faker.name.firstName(),
          last: h.faker.name.lastName()
        };
      });
      m.deploy.queueSchema("foo", 5).generate();

      const listOfFoos = m.db.foos;
      const keys = Object.keys(listOfFoos);
      const firstFoo = listOfFoos[first(keys)];

      expect(listOfFoos).is.an("object");
      expect(firstFoo.first).is.a("string");
      expect(firstFoo.last).is.a("string");
      expect(keys.length).is.equal(5);
    });

    it("using pluralName() modifier changes a schema's database path", async () => {
      const m = await Mock.prepare();
      m.addSchema("foo")
        .mock((h: SchemaHelper) => () => ({ result: "result" }))
        .pluralName("fooie")
        .addSchema("company") // built-in exception
        .mock((h: SchemaHelper) => () => "ignored")
        .addSchema("fungus") // rule trigger
        .mock((h: SchemaHelper) => () => "ignored");
      m.deploy
        .queueSchema("foo")
        .queueSchema("company")
        .queueSchema("fungus")
        .generate();

      expect(m.db.foos).is.equal(undefined);
      expect(m.db.fooie).is.an("object");
      expect(firstProp(m.db.fooie).result).is.equal("result");
      expect(m.db.companies).is.an("object");
      expect(m.db.fungi).is.an("object");
    });

    it("using modelName() modifier changes db path appropriately", async () => {
      const m = await Mock.prepare();
      m.addSchema("foo")
        .mock((h: SchemaHelper) => () => ({ result: "result" }))
        .modelName("car");
      m.deploy.queueSchema("foo").generate();

      expect(m.db.foos).is.equal(undefined);
      expect(m.db.cars).is.an("object");

      expect(firstProp(m.db.cars).result).is.equal("result");
    });

    it("using pathPrefix the generated data is appropriately offset", async () => {
      const m = await Mock.prepare();
      m.addSchema("car")
        .mock((h: SchemaHelper) => () => ({ result: "result" }))
        .pathPrefix("authenticated");
      m.deploy.queueSchema("car", 10).generate();

      expect(m.db.authenticated).is.an("object");
    });

    it("Mocking function that returns a scalar works as intended", async () => {
      const m = await Mock.prepare();
      m.addSchema("number", h => () =>
        h.faker.random.number({ min: 0, max: 1000 })
      );
      m.addSchema("string", h => () => h.faker.random.words(3));
      m.queueSchema("number", 10);
      m.queueSchema("string", 10);
      m.generate();

      expect(firstProp(m.db.strings)).is.a("string");
      expect(lastProp(m.db.strings)).is.a("string");
      expect(firstProp(m.db.numbers)).is.a("number");
      expect(lastProp(m.db.numbers)).is.a("number");
    });
  });

  describe("Relationships", () => {
    it("Adding belongsTo relationship adds FK property with empty value", async () => {
      const m = await Mock.prepare();
      m.addSchema("user")
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo("company");
      m.queueSchema("user").generate();

      expect(firstProp(m.db.users)).has.property("companyId");
      expect(firstProp(m.db.users).companyId).is.equal("");
    });
    it("Adding belongsTo relationship adds fulfilled shadow FK property when external schema not present", async () => {
      const m = await Mock.prepare();
      m.addSchema("user")
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo("company");
      m.queueSchema("user", 2)
        .fulfillBelongsTo("company")
        .generate();

      expect(firstProp(m.db.users)).has.property("companyId");
      expect(lastProp(m.db.users)).has.property("companyId");
      expect(firstProp(m.db.users).companyId).is.a("string");
      expect(firstProp(m.db.users).companyId.slice(0, 1)).is.equal("-");
      expect(firstProp(m.db.users).companyId).is.not.equal(
        lastProp(m.db.users).companyId
      );
    });

    it("Adding belongsTo relationship adds fulfilled real FK property when external schema is present but not deployed", async () => {
      const m = await Mock.prepare();
      m.addSchema("user")
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo("company");
      m.addSchema("company").mock((h: SchemaHelper) => () => {
        return { companyName: h.faker.company.companyName() };
      });
      m.deploy
        .queueSchema("user", 2)
        .fulfillBelongsTo("company")
        .generate();

      expect(firstProp(m.db.users)).has.property("companyId");
      expect(firstProp(m.db.users).companyId).is.a("string");
      expect(firstProp(m.db.users).companyId.slice(0, 1)).is.equal("-");
      const companyFK = firstProp(m.db.users).companyId;
      const companyIds = Object.keys(m.db.companies);
      expect(companyIds.indexOf(companyFK)).is.not.equal(-1);
    });

    it("Adding belongsTo relationship adds fulfilled real FK property when available in DB", async () => {
      const m = await Mock.prepare();
      m.addSchema("user")
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.name.firstName() };
        })
        .belongsTo("company");
      m.addSchema("company").mock((h: SchemaHelper) => () => {
        return { companyName: h.faker.company.companyName() };
      });
      m.deploy
        .queueSchema("user", 2)
        .fulfillBelongsTo("company")
        .queueSchema("company", 10)
        .generate();

      const firstCompanyId = firstProp(m.db.users).companyId;
      const companyIds = Object.keys(m.db.companies);
      expect(firstProp(m.db.users)).has.property("companyId");
      expect(firstCompanyId).is.a("string");
      expect(firstCompanyId.slice(0, 1)).is.equal("-");
      expect(companyIds.indexOf(firstCompanyId)).is.not.equal(-1);
    });

    it("Adding hasMany relationship does not add FK property without quantifyHasMany()", async () => {
      const m = await Mock.prepare();
      m.addSchema("company")
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany("employee");
      m.deploy.queueSchema("company").generate();

      expect(firstProp(m.db.companies).employees).is.equal(undefined);
    });

    it("Adding hasMany with quantifyHasMany() produces ghost references when FK reference is not a defined schema", async () => {
      const m = await Mock.prepare();
      m.addSchema("company")
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany("employee");
      m.deploy
        .queueSchema("company")
        .quantifyHasMany("employee", 10)
        .generate();

      expect(firstProp(m.db.companies).employees).is.an("object");
      expect(Object.keys(firstProp(m.db.companies).employees).length).is.equal(
        10
      );
      expect(m.db.employees).to.not.be.an("object");
    });
    it("Adding hasMany with quantifyHasMany() produces real references when FK reference is a defined schema", async () => {
      const m = await Mock.prepare();
      m.addSchema("company")
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany("employee");
      m.addSchema("employee").mock((h: SchemaHelper) => () => {
        return {
          first: h.faker.name.firstName(),
          last: h.faker.name.lastName()
        };
      });
      m.deploy
        .queueSchema("company")
        .quantifyHasMany("employee", 10)
        .generate();

      expect(firstProp(m.db.companies).employees).is.an("object");
      expect(Object.keys(firstProp(m.db.companies).employees).length).is.equal(
        10
      );
      expect(m.db.employees).to.not.equal(undefined);
    });

    it("Adding hasMany with quantifyHasMany() leverages existing FK schemas when they already exist", async () => {
      const m = await Mock.prepare();
      m.addSchema("company")
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany("employee");
      m.addSchema("employee").mock((h: SchemaHelper) => () => {
        return {
          first: h.faker.name.firstName(),
          last: h.faker.name.lastName()
        };
      });
      m.deploy
        .queueSchema("employee", 25)
        .queueSchema("company")
        .quantifyHasMany("employee", 10);
      m.deploy.generate();

      const company = firstProp(m.db.companies);
      expect(company.employees).is.an("object");
      expect(Object.keys(company.employees).length).is.equal(10);
      expect(m.db.employees).to.not.equal(undefined);
      expect(Object.keys(m.db.employees).length).to.equal(25);
    });

    it("Adding hasMany with quantifyHasMany() leverages existing FK schemas when they already exist, adds more when runs out", async () => {
      const m = await Mock.prepare();
      m.addSchema("company")
        .mock((h: SchemaHelper) => () => {
          return { name: h.faker.company.companyName() };
        })
        .hasMany("employee");
      m.addSchema("employee").mock((h: SchemaHelper) => () => {
        return {
          first: h.faker.name.firstName(),
          last: h.faker.name.lastName()
        };
      });
      m.deploy
        .queueSchema("employee", 5)
        .queueSchema("company")
        .quantifyHasMany("employee", 10)
        .generate();

      expect(firstProp(m.db.companies).employees).is.an("object");
      expect(Object.keys(firstProp(m.db.companies).employees).length).is.equal(
        10
      );
      expect(m.db.employees).to.not.equal(undefined);
      expect(Object.keys(m.db.employees).length).to.equal(10);
    });

    it("Mock can generate more than once", async () => {
      const m = await Mock.prepare();
      m.addSchema("employee", employeeMocker);
      m.queueSchema("employee", 10);
      m.generate();
      expect(helpers.length(m.db.employees)).to.equal(10);
      m.queueSchema("employee", 5);
      m.generate();
      expect(helpers.length(m.db.employees)).to.equal(15);
    });
  });
});
