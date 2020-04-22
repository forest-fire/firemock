// tslint:disable:no-implicit-dependencies
import * as chai from "chai";
import * as helpers from "./testing/helpers";
import set from "lodash.set";
import {
  Mock,
  SchemaCallback,
  IFirebaseEventHandler,
  GenericEventHandler,
  HandleValueEvent
} from "../src";
import {
  clearDatabase,
  pushDB,
  setDB,
  removeDB,
  updateDB,
  reset,
  getDb
} from "../src/rtdb/store";
import {
  addListener,
  listenerCount,
  removeAllListeners,
  removeListener,
  listenerPaths,
  findChildListeners,
  findValueListeners
} from "../src/rtdb/listeners";
import "mocha";
import { wait } from "common-types";

const expect = chai.expect;

interface IPerson {
  name: string;
  age: number;
}
const personMock: SchemaCallback<IPerson> = h => () => ({
  name: h.faker.name.firstName(),
  age: h.faker.random.number({ min: 1, max: 70 }),
  foo: "bar",
  baz: "baz"
});

describe("Database", () => {
  describe("Basics", () => {
    it("can clear database", () => {
      setDB("foo", "bar");
      expect(Object.keys(getDb()).length).to.equal(1);
      clearDatabase();
      expect(Object.keys(getDb()).length).to.equal(0);
    });
  });

  describe("Listeners", () => {
    it("can add listeners", () => {
      const callback: GenericEventHandler = snap => null;
      addListener("/path/to/node", "value", callback);
      expect(listenerCount()).to.equal(1);
      addListener("/path/to/node", "value", callback);
      expect(listenerCount()).to.equal(2);
    });

    it("can remove all listeners", () => {
      const callback: GenericEventHandler = snap => undefined;
      removeAllListeners();
      addListener("/path/to/node", "value", callback);
      addListener("/path/to/node", "value", callback);
      addListener("/path/to/node", "value", callback);
      expect(listenerCount()).to.equal(3);
      removeListener();
      expect(listenerCount()).to.equal(0);
      addListener("/path/to/node", "value", callback);
      addListener("/path/to/node", "value", callback);
      addListener("/path/to/node", "value", callback);
      expect(listenerCount()).to.equal(3);
      removeAllListeners();
    });

    it("can remove all listeners of given eventType", () => {
      const callback: GenericEventHandler = snap => undefined;
      removeAllListeners();
      addListener("/path/to/value1", "value", callback);
      addListener("/path/to/added", "child_added", callback);
      addListener("/path/to/value2", "value", callback);
      addListener("/path/to/moved", "child_moved", callback);
      removeListener("child_added");
      expect(listenerCount()).to.equal(3);
      listenerPaths().forEach(p => expect(p).to.not.include("added"));
      removeListener("value");
      expect(listenerCount()).to.equal(1);
      listenerPaths().forEach(p => expect(p).to.include("moved"));
    });

    it("can remove listeners of same eventType, callback", () => {
      const callback: GenericEventHandler = snap => undefined;
      const callback2: GenericEventHandler = snap => undefined;
      removeAllListeners();
      addListener("/path/to/value1", "value", callback);
      addListener("/path/to/value2", "value", callback);
      addListener("/path/to/added", "child_added", callback);
      addListener("/path/to/value3", "value", callback2);
      addListener("/path/to/moved", "child_moved", callback);
      removeListener("value", callback);
      expect(listenerCount()).to.equal(3);
      expect(listenerCount("value")).to.equal(1);
      listenerPaths("value").forEach(l => expect(l).to.include("value3"));
    });

    it("can remove listeners of same eventType, callback, and context", () => {
      const callback: GenericEventHandler = snap => undefined;
      const callback2: GenericEventHandler = snap => undefined;
      const context = { foo: "bar" };
      const context2 = { foo: "baz" };
      removeAllListeners();
      addListener("/path/to/value1", "value", callback, null, context);
      addListener("/path/to/value2", "value", callback2, null, context);
      addListener("/path/to/added", "child_added", callback, null, context);
      addListener("/path/to/value3", "value", callback2, null, context2);
      addListener("/path/to/moved", "child_moved", callback, null, context);
      expect(listenerCount()).to.equal(5);
      removeListener("value", callback2, context2);
      expect(listenerCount()).to.equal(4);
      expect(listenerPaths("value")).to.be.length(2);
    });

    it("cancel callbacks are called when set", () => {
      let count = 0;
      const callback: GenericEventHandler = snap => undefined;
      const callback2: GenericEventHandler = snap => undefined;
      const cancelCallback = () => count++;
      removeAllListeners();
      addListener("/path/to/value1", "value", callback, cancelCallback);
      addListener("/path/to/value2", "value", callback2, cancelCallback);
      addListener("/path/to/added", "child_added", callback, cancelCallback);
      addListener("/path/to/value3", "value", callback2);
      addListener("/path/to/moved", "child_moved", callback);
      let howMany = removeAllListeners();
      expect(howMany).to.equal(3);
      expect(count).to.equal(3);
      addListener("/path/to/value1", "value", callback, cancelCallback);
      addListener("/path/to/value2", "value", callback2, cancelCallback);
      addListener("/path/to/added", "child_added", callback, cancelCallback);
      addListener("/path/to/value3", "value", callback2);
      addListener("/path/to/moved", "child_moved", callback);
      howMany = removeListener("value");
      expect(howMany).to.equal(2);
      expect(count).to.equal(5);
    });
  });

  describe("Writing to DB", () => {
    it("pushDB() works", () => {
      clearDatabase();
      const pushKey = pushDB("/people", {
        name: "Humpty Dumpty",
        age: 5
      });
      // check directly in DB
      expect(pushKey).to.be.a("string");
      expect(pushKey).to.include("-");
      expect(getDb().people[pushKey]).to.be.an("object");
      expect(getDb().people[pushKey].name).to.equal("Humpty Dumpty");
    });

    it("setDB() works", () => {
      clearDatabase();
      setDB("/people/abc", {
        name: "Humpty Dumpty",
        age: 5
      });
      expect(getDb().people.abc).to.be.an("object");
      expect(getDb().people.abc.name).to.equal("Humpty Dumpty");
    });

    it("updateDB() works", () => {
      clearDatabase();
      updateDB("/people/update", {
        name: "Humpty Dumpty",
        age: 5
      });
      expect(getDb().people.update).to.be.an("object");
      expect(getDb().people.update.name).to.equal("Humpty Dumpty");
      expect(getDb().people.update.age).to.equal(5);
      updateDB("/people/update", {
        age: 6,
        nickname: "Humpty"
      });
      expect(getDb().people.update.name).to.equal("Humpty Dumpty");
      expect(getDb().people.update.age).to.equal(6);
      expect(getDb().people.update.nickname).to.equal("Humpty");
    });

    it("removeDB() works", () => {
      clearDatabase();
      setDB("/people/remove", {
        name: "Humpty Dumpty",
        age: 5
      });
      expect(getDb().people.remove.name).to.equal("Humpty Dumpty");
      expect(getDb().people.remove.age).to.equal(5);
      removeDB("/people/remove");

      expect(getDb().people.remove).to.equal(undefined);
    });
  });

  describe("Find Listeners", () => {
    it("find all child listeners at a path", () => {
      const callback: HandleValueEvent = snap => undefined;
      removeAllListeners();
      addListener("/auth/people", "child_removed", callback);
      addListener("/auth/people", "child_added", callback);
      addListener("/auth/people", "child_moved", callback);
      addListener("/people", "child_removed", callback);
      addListener("/auth/people", "value", callback);
      addListener("/auth/company", "child_removed", callback);
      const listeners = findChildListeners("/auth/people");

      expect(listeners).length(3);
    });

    it("find all child listeners at a path below the listening path", () => {
      const callback: HandleValueEvent = snap => undefined;
      removeAllListeners();
      addListener("/auth/people", "child_removed", callback);
      addListener("/auth/people", "child_added", callback);
      addListener("/auth/people", "child_moved", callback);
      addListener("/people", "child_removed", callback);
      addListener("/auth/people", "value", callback);
      addListener("/auth/company", "child_removed", callback);
      const listeners = findChildListeners("/auth/people/1234");

      expect(listeners).length(3);
    });

    it("find all child listeners at a path and event type", () => {
      const callback: HandleValueEvent = snap => undefined;
      removeAllListeners();
      addListener("/auth/people", "child_removed", callback);
      addListener("/auth/people", "child_added", callback);
      addListener("/auth/people", "child_moved", callback);
      addListener("/people", "child_removed", callback);
      addListener("/auth/people", "value", callback);
      addListener("/auth/company", "child_removed", callback);
      const listeners = findChildListeners("/auth/people", "child_added");
      expect(listeners).length(1);
    });

    it("find all value listeners at a path", () => {
      const callback: HandleValueEvent = snap => undefined;
      removeAllListeners();
      addListener("/auth/people", "child_removed", callback);
      addListener("/auth/people", "child_added", callback);
      addListener("/auth/people", "child_moved", callback);
      addListener("/people", "child_removed", callback);
      addListener("/auth/people", "value", callback);
      addListener("/auth", "value", callback);
      addListener("/auth/company", "child_removed", callback);
      const listenAtpeople = findValueListeners("/auth/people");
      expect(listenAtpeople).length(2);
      const listenAtAuth = findValueListeners("/auth");
      expect(listenAtAuth).length(1);
    });
  });

  describe("Handle Events", () => {
    it('"value" responds to NEW child', async () => {
      reset();
      const callback: HandleValueEvent = snap => {
        if (snap.val()) {
          const record = helpers.firstRecord(snap.val());
          expect(record.name).to.equal("Humpty Dumpty");
          expect(record.age).to.equal(5);
        }
      };
      await addListener("/people", "value", callback);
      expect(listenerCount()).to.equal(1);
      const pushKey = pushDB("/people", {
        name: "Humpty Dumpty",
        age: 5
      });
    });

    it('"value" responds to UPDATED child', async () => {
      reset();
      const m = await Mock.prepare();
      m.addSchema("person", personMock);
      m.queueSchema("person", 10);
      m.generate();
      let status = "no-listener";
      let firstRecord: any;
      let firstKey: any;

      const callback: HandleValueEvent = snap => {
        if (status === "has-listener") {
          const list: any = snap.val();
          const first: any = list[firstKey];
          expect(first.age).to.equal(firstRecord.age + 1);
        }
      };

      await addListener("/people", "value", callback);
      expect(listenerCount()).to.equal(1);

      status = "has-listener";
      const people = await m.ref("/people").once("value");

      firstKey = helpers.firstKey(people.val());
      firstRecord = helpers.firstRecord(people.val());

      updateDB(`/people/${firstKey}`, { age: firstRecord.age + 1 });
    });

    it('"value" responds to deeply nested CHANGE', async () => {
      reset();
      const callback: HandleValueEvent = snap => {
        const record = snap.val();
        if (record) {
          expect(record.a.b.c.d.name).to.equal("Humpty Dumpty");
          expect(record.a.b.c.d.age).to.equal(5);
        } else {
          // during initialization
          expect(snap.val()).to.equal(undefined);
        }
      };
      await addListener("/people", "value", callback);
      expect(listenerCount()).to.equal(1);
      setDB("/people/a/b/c/d", {
        name: "Humpty Dumpty",
        age: 5
      });
    });

    it('"value" responds to REMOVED child', async () => {
      reset();
      const m = await Mock.prepare();
      m.addSchema("person", personMock);
      m.queueSchema("person", 10);
      m.generate();
      let status = "starting";
      const people = (await m.ref("/people").once("value")).val();
      expect(Object.keys(people)).to.have.lengthOf(10);
      const firstKey = helpers.firstKey(people);

      const callback: IFirebaseEventHandler = snap => {
        const list = snap.val();
        if (list) {
          expect(snap.numChildren()).to.equal(status === "starting" ? 10 : 9);
          if (status === "starting") {
            expect(Object.keys(list)).to.include(firstKey);
          } else {
            expect(Object.keys(list)).to.not.include(firstKey);
          }
        }
      };

      await addListener("/people", "value", callback);
      expect(listenerCount()).to.equal(1);

      status = "after";
      removeDB(`/people/${firstKey}`);

      const andThen = (await m.ref("/people").once("value")).val();

      expect(Object.keys(andThen)).to.have.lengthOf(9);
      expect(Object.keys(andThen)).to.not.include(firstKey);
    });
  });

  describe("Initialing DB state", () => {
    it("passing in dictionary for db config initializes the DB", async () => {
      reset();
      const m = await Mock.prepare({
        db: { foo: { bar: true, baz: true } }
      });

      expect(getDb()).to.be.an("object");
      expect(getDb().foo).to.be.an("object");
      expect(getDb().foo.bar).to.equal(true);
      expect(getDb().foo.baz).to.equal(true);
    });

    it("passing in an async function to db config initializes the DB", async () => {
      reset();
      const m = await Mock.prepare({
        db: async () => {
          await wait(5);
          return {
            foo: { bar: true, baz: true }
          };
        }
      });

      expect(getDb()).to.be.an("object");
      expect(getDb().foo).to.be.an("object");
      expect(getDb().foo.bar).to.equal(true);
      expect(getDb().foo.baz).to.equal(true);
    });
  });

  describe("Other", () => {
    it('"value" responds to scalar value set', async () => {
      reset();
      let status = "no-listener";
      const callback: IFirebaseEventHandler = snap => {
        if (status === "listener") {
          const scalar = snap.val();
          expect(scalar).to.equal(53);
        }
      };
      await addListener("/scalar", "value", callback);
      status = "listener";
      setDB("/scalar", 53);
    });

    it('"child_added" responds to NEW child', async () => {
      let ready = false;
      const callback: HandleValueEvent = snap => {
        if (ready) {
          const person = snap.val();
          expect(person.name).equal("Chris Christy");
          expect(person.age).equal(100);
        }
      };
      await addListener("/people", "child_added", callback);
      ready = true;
      pushDB("/people", {
        name: "Chris Christy",
        age: 100
      });
    });

    it('"child_added" ignores changed child', async () => {
      reset();
      setDB("people.abcd", { name: "Chris Chisty", age: 100 });
      let ready = false;
      const callback: HandleValueEvent = snap => {
        if (ready) {
          throw new Error("Should NOT have called callback!");
        }
      };
      await addListener("/people", "child_added", callback);
      ready = true;
      const christy = helpers.firstKey(getDb("people"));
      updateDB(`/people/abcd`, {
        age: 150
      });
    });

    it('"child_added" ignores removed child', async () => {
      reset();
      setDB("people.abcd", {
        name: "Chris Chisty",
        age: 100
      });
      let ready = false;
      const callback: HandleValueEvent = snap => {
        if (ready) {
          throw new Error("Should NOT have called callback!");
        }
      };
      await addListener("/people", "child_added", callback);
      ready = true;
      removeDB(`/people/abcd`);
    });

    it('"child_removed" responds to removed child', async () => {
      reset();
      setDB("people.abcd", {
        name: "Chris Chisty",
        age: 100
      });
      let ready = false;
      const callback: HandleValueEvent = snap => {
        if (ready) {
          expect(getDb().people).to.be.an("object");
          expect(Object.keys(getDb().people)).length(0);
        } else {
          expect(Object.keys(getDb().people)).length(1);
        }
      };
      await addListener("/people", "child_removed", callback);
      ready = true;
      removeDB(`/people/abcd`);
    });

    it('"child_removed" ignores added child', async () => {
      reset();
      let ready = false;
      const callback: HandleValueEvent = snap => {
        if (ready) {
          throw new Error("Should NOT have called callback!");
        }
      };

      await addListener("/people", "child_removed", callback);
      ready = true;
      setDB("people.abcd", {
        name: "Chris Chisty",
        age: 100
      });
    });

    it('"child_removed" ignores removal of non-existing child', async () => {
      reset();
      let ready = false;
      const callback: HandleValueEvent = snap => {
        if (ready) {
          throw new Error(
            `Should NOT have called callback! [ ${snap.key}, ${snap.val()} ]`
          );
        }
      };

      await addListener("/people", "child_removed", callback);
      ready = true;
      removeDB("people.abcdefg");
    });

    it('"child_changed" responds to a new child', async () => {
      reset();
      setDB("people.abcd", {
        name: "Chris Chisty",
        age: 100
      });
      let ready = false;
      const callback: HandleValueEvent = snap => {
        if (ready) {
          expect(getDb("people")).to.be.an("object");
          expect(getDb("people")).to.have.all.keys("abcd", snap.key);
          expect(helpers.length(getDb("people"))).to.equal(2);
          expect(snap.val().name).to.equal("Barbara Streisand");
        }
      };
      await addListener("/people", "child_changed", callback);
      ready = true;
      pushDB(`/people`, {
        name: "Barbara Streisand",
        age: 70
      });
    });

    it('"child_changed" responds to a removed child', done => {
      reset();
      setDB("people.abcd", {
        name: "Chris Chisty",
        age: 100
      });

      const callback: HandleValueEvent = snap => {
        expect(getDb("people")).to.be.an("object");
        expect(getDb("people")).to.not.have.key("abcd");
        done();
      };
      expect(getDb("people")).to.have.key("abcd");
      addListener("/people", "child_removed", callback);
      removeDB(`/people.abcd`);
    });
  });
});
