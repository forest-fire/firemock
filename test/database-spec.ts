// tslint:disable:no-implicit-dependencies
import * as chai from "chai";
import * as helpers from "./testing/helpers";
import set from "lodash.set";
import { Mock, SchemaCallback } from "../src/index";
import {
  db,
  clearDatabase,
  addListener,
  listenerCount,
  removeListener,
  removeAllListeners,
  listenerPaths,
  pushDB,
  setDB,
  removeDB,
  updateDB,
  findChildListeners,
  findValueListeners,
  reset
} from "../src/database";
import { GenericEventHandler, HandleValueEvent } from "../src/query";
import "mocha";

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
      db.foo = "bar";
      expect(Object.keys(db).length).to.equal(1);
      clearDatabase();
      expect(Object.keys(db).length).to.equal(0);
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
      expect(db.people[pushKey]).to.be.an("object");
      expect(db.people[pushKey].name).to.equal("Humpty Dumpty");
    });

    it("setDB() works", () => {
      clearDatabase();
      setDB("/people/abc", {
        name: "Humpty Dumpty",
        age: 5
      });
      expect(db.people.abc).to.be.an("object");
      expect(db.people.abc.name).to.equal("Humpty Dumpty");
    });

    it("updateDB() works", () => {
      clearDatabase();
      updateDB("/people/update", {
        name: "Humpty Dumpty",
        age: 5
      });
      expect(db.people.update).to.be.an("object");
      expect(db.people.update.name).to.equal("Humpty Dumpty");
      expect(db.people.update.age).to.equal(5);
      updateDB("/people/update", {
        age: 6,
        nickname: "Humpty"
      });
      expect(db.people.update.name).to.equal("Humpty Dumpty");
      expect(db.people.update.age).to.equal(6);
      expect(db.people.update.nickname).to.equal("Humpty");
    });

    it("removeDB() works", () => {
      clearDatabase();
      setDB("/people/remove", {
        name: "Humpty Dumpty",
        age: 5
      });
      expect(db.people.remove.name).to.equal("Humpty Dumpty");
      expect(db.people.remove.age).to.equal(5);
      removeDB("/people/remove");

      expect(db.people.remove).to.equal(undefined);
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
    it('"value" responds to NEW child', done => {
      reset();
      const callback: HandleValueEvent = snap => {
        const record = helpers.firstRecord(snap.val());

        expect(record.name).to.equal("Humpty Dumpty");
        expect(record.age).to.equal(5);
        done();
      };
      addListener("/people", "value", callback);
      expect(listenerCount()).to.equal(1);
      const pushKey = pushDB("/people", {
        name: "Humpty Dumpty",
        age: 5
      });
    });

    it('"value" responds to UPDATED child', async () => {
      reset();
      const m = await Mock.prepare();
      return new Promise((resolve, reject) => {
        m.addSchema("person", personMock);
        m.queueSchema("person", 10);
        m.generate();
        m.ref("/people")
          .once("value")
          .then(people => {
            const firstKey = helpers.firstKey(people.val());
            const firstRecord = helpers.firstRecord(people.val());
            const callback: HandleValueEvent = snap => {
              const list = snap.val();
              const first = helpers.firstRecord(list);
              expect(first.age).to.equal(firstRecord.age + 1);
              resolve();
            };
            addListener("/people", "value", callback);
            expect(listenerCount()).to.equal(1);
            updateDB(`/people/${firstKey}`, { age: firstRecord.age + 1 });
          });
      });
    });

    it('"value" responds to deeply nested CHANGE', done => {
      reset();
      const callback: HandleValueEvent = snap => {
        const record = snap.val();
        expect(record.a.b.c.d.name).to.equal("Humpty Dumpty");
        expect(record.a.b.c.d.age).to.equal(5);
        done();
      };
      addListener("/people", "value", callback);
      expect(listenerCount()).to.equal(1);
      setDB("/people/a/b/c/d", {
        name: "Humpty Dumpty",
        age: 5
      });
    });

    it('"value" responds to REMOVED child', async () => {
      reset();
      const m = await Mock.prepare();
      return new Promise(resolve => {
        m.addSchema("person", personMock);
        m.queueSchema("person", 10);
        m.generate();
        m.ref("/people")
          .once("value")
          .then(people => {
            const firstKey = helpers.firstKey(people.val());
            const callback: HandleValueEvent = snap => {
              const list = snap.val();
              expect(snap.numChildren()).to.equal(9);
              expect(Object.keys(list)).to.not.include(firstKey);
              resolve();
            };
            addListener("/people", "value", callback);
            expect(listenerCount()).to.equal(1);
            removeDB(`/people/${firstKey}`);
          });
      });
    });

    it('"value" responds to scalar value set', done => {
      reset();
      const callback: HandleValueEvent = snap => {
        const scalar = snap.val();
        expect(scalar).to.not.equal(53);
        done();
      };
      addListener("/scalar", "value", callback);
      setDB("/scalar", 53);
    });

    it('"child_added" responds to NEW child', done => {
      reset();
      const callback: HandleValueEvent = snap => {
        const person = snap.val();
        expect(person.name).equal("Chris Christy");
        expect(person.age).equal(100);
        done();
      };
      addListener("/people", "child_added", callback);
      pushDB("/people", {
        name: "Chris Christy",
        age: 100
      });
    });

    it('"child_added" ignores changed child', done => {
      reset();
      set(db, "people.abcd", {
        name: "Chris Chisty",
        age: 100
      });
      const callback: HandleValueEvent = snap => {
        done("Should NOT have called callback!");
      };
      addListener("/people", "child_added", callback);
      const christy = helpers.firstKey(db.people);
      updateDB(`/people/abcd`, {
        age: 150
      });
      setTimeout(() => {
        done();
      }, 50);
    });

    it('"child_added" ignores removed child', done => {
      reset();
      set(db, "people.abcd", {
        name: "Chris Chisty",
        age: 100
      });
      const callback: HandleValueEvent = snap => {
        done("Should NOT have called callback!");
      };
      addListener("/people", "child_added", callback);
      removeDB(`/people/abcd`);
      setTimeout(() => {
        done();
      }, 50);
    });

    it('"child_removed" responds to removed child', done => {
      reset();
      set(db, "people.abcd", {
        name: "Chris Chisty",
        age: 100
      });
      const callback: HandleValueEvent = snap => {
        expect(db.people).to.be.an("object");
        expect(Object.keys(db.people)).length(0);
        done();
      };
      addListener("/people", "child_removed", callback);
      removeDB(`/people/abcd`);
    });

    it('"child_removed" ignores added child', done => {
      reset();

      const callback: HandleValueEvent = snap => {
        done("Should NOT have called callback!");
      };
      addListener("/people", "child_removed", callback);
      setDB("people.abcd", {
        name: "Chris Chisty",
        age: 100
      });
      setTimeout(() => {
        done();
      }, 50);
    });

    it('"child_removed" ignores removal of non-existing child', done => {
      reset();
      const callback: HandleValueEvent = snap => {
        done("Should NOT have called callback!");
      };
      addListener("/people", "child_removed", callback);
      removeDB("people.abcdefg");
      setTimeout(() => {
        done();
      }, 50);
    });

    it('"child_changed" responds to a new child', done => {
      reset();
      set(db, "people.abcd", {
        name: "Chris Chisty",
        age: 100
      });
      const callback: HandleValueEvent = snap => {
        expect(db.people).to.be.an("object");
        expect(db.people).to.have.all.keys("abcd", snap.key);
        expect(helpers.length(db.people)).to.equal(2);
        expect(snap.val().name).to.equal("Barbara Streisand");
        done();
      };
      addListener("/people", "child_changed", callback);
      pushDB(`/people`, {
        name: "Barbara Streisand",
        age: 70
      });
    });

    it('"child_changed" responds to a removed child', done => {
      reset();
      set(db, "people.abcd", {
        name: "Chris Chisty",
        age: 100
      });
      const callback: HandleValueEvent = snap => {
        expect(db.people).to.be.an("object");
        expect(db.people).to.not.have.key("abcd");
        done();
      };
      addListener("/people", "child_changed", callback);
      removeDB(`/people.abcd`);
    });
  });
});
