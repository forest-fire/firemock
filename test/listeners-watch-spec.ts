// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
import {
  Query,
  SnapShot,
  IMockWatcherGroupEvent,
  IDictionary,
  SchemaHelper,
  Mock
} from "../src";
import { DataSnapshot } from "@firebase/database-types";
import {
  updateDB,
  removeDB,
  pushDB,
  setDB,
  getDb,
  multiPathUpdateDB
} from "../src/database";

const expect = chai.expect;

describe("Listener events ->", () => {
  it('listening on a "value" event detects changes', async () => {
    const queryRef = new Query("userProfile/1234", 10);
    let events: IDictionary[] = [];
    const cb = (snap: DataSnapshot, prevKey: any) => {
      events.push({ key: snap.key, snap: snap.val(), prevKey });
    };
    queryRef.on("value", cb);
    updateDB("userProfile/1234/name", "Bob Marley");
    expect(events).to.have.lengthOf(1);
    expect(events[0].snap).to.haveOwnProperty("name");
    expect(events[0].snap.name).to.equal("Bob Marley");
    events = [];

    updateDB("userProfile/1234/age", 13);
    expect(events[0].snap).to.haveOwnProperty("age");
    expect(events[0].snap.age).to.equal(13);
    expect(events[0].snap.name).to.equal("Bob Marley");
    events = [];
    updateDB("userProfile/1234/ssn", "044-123-4545");
    events = [];

    // remove an attribute
    removeDB("userProfile/1234/age");
    expect(events[0].snap.name).to.equal("Bob Marley");
    expect(events[0].snap.ssn).to.equal("044-123-4545");
    expect(events[0].snap.age).to.equal(undefined);
    events = [];

    // remove the object
    removeDB("userProfile/1234");
    expect(events[0].snap).to.equal(undefined);
  });

  it('listening on "on_child" events', async () => {
    const queryRef = new Query("userProfile", 10);
    let events: IDictionary[] = [];
    const cb = (eventType: string) => (snap: DataSnapshot, prevKey?: any) => {
      events.push({ eventType, val: snap.val(), key: snap.key, prevKey, snap });
    };
    const userProfileListener = queryRef.on("child_added", cb("child_added"));
    queryRef.on("child_moved", cb("child_moved"));
    queryRef.on("child_changed", cb("child_changed"));
    queryRef.on("child_removed", cb("child_removed"));

    updateDB("userProfile/abcd/name", "Bob Marley");
    events.map(e => expect(e.key).to.equal("abcd"));
    expect(events.map(e => e.eventType)).includes("child_added");
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).not.includes("child_updated");
    expect(events.map(e => e.eventType)).includes("child_moved");
    events = [];

    updateDB("userProfile/p-tosh", { name: "Peter Tosh" });
    events.map(e => expect(e.key).to.equal("p-tosh"));
    expect(events.map(e => e.eventType)).includes("child_added");
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).not.includes("child_removed");
    expect(events.map(e => e.eventType)).includes("child_moved");
    events = [];

    pushDB("userProfile", { name: "Jane Doe" });
    events.map(e => {
      expect(e.key).to.be.a("string");
      expect(e.key.slice(0, 1)).to.equal("-");
    });
    expect(events.map(e => e.eventType)).includes("child_added");
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).not.includes("child_removed");
    expect(events.map(e => e.eventType)).includes("child_moved");
    events = [];

    setDB("userProfile/jjohnson", { name: "Jack Johnson", age: 45 });
    events.map(e => expect(e.key).to.equal("jjohnson"));
    expect(events.map(e => e.eventType)).includes("child_added");
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).not.includes("child_removed");
    expect(events.map(e => e.eventType)).includes("child_moved");
    events = [];

    updateDB("userProfile/jjohnson/age", 99);
    events.map(e => expect(e.key).to.equal("jjohnson"));
    expect(events.map(e => e.eventType)).not.includes("child_added");
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).not.includes("child_removed");
    expect(events.map(e => e.eventType)).not.includes("child_moved");
    events = [];

    removeDB("userProfile/p-tosh");
    events.map(e => expect(e.key).to.equal("p-tosh"));
    expect(events.map(e => e.eventType)).includes("child_removed");
    expect(events.map(e => e.eventType)).not.includes("child_changed");
    expect(events.map(e => e.eventType)).not.includes("child_added");
    events = [];

    pushDB("userProfile", { name: "Chris Christy" });
    events.map(e => {
      expect(e.key).to.be.a("string");
      expect(e.key.slice(0, 1)).to.equal("-");
    });
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).includes("child_added");
    events = [];

    setDB("userProfile/jjohnson/age", { name: "Jack Johnson", age: 88 });
    events.map(e => expect(e.key).to.equal("jjohnson"));
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).not.includes("child_added");
  });

  it.only("dispatch works for a MPS", async () => {
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

    const firstEmployee = helpers.firstKey(m.db.employees);
    const firstCompany = helpers.firstKey(m.db.companies);
    const mps = [
      { [`employees/${firstEmployee}/age`]: 45 },
      { [`companies/${firstEmployee}/address`]: "123 Nowhere Ave" }
    ];

    multiPathUpdateDB(mps);

    console.log(m.db)
  });
});
