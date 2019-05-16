// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import * as helpers from "./testing/helpers";
import { Query } from "../src";
import { DataSnapshot } from "@firebase/database-types";
import { updateDB, removeDB, pushDB, setDB } from "../src/database";

const expect = chai.expect;

describe("Listener events ->", () => {
  it('listening on a "value" event detects changes', async () => {
    const queryRef = new Query("userProfile/1234", 10);
    const events = [];
    const cb = (snap: DataSnapshot, value: any) => {
      events.push({ snap: snap.val(), value });
      console.log("event", snap.val(), value);
    };
    queryRef.on("value", cb);
    updateDB("userProfile/1234/name", "Bob Marley");
    expect(events).to.have.lengthOf(1);
    expect(events[0].snap).to.haveOwnProperty("name");
    expect(events[0].snap.name).to.equal("Bob Marley");
    updateDB("userProfile/1234/age", 13);
    expect(events[1].snap).to.haveOwnProperty("age");
    expect(events[1].snap.age).to.equal(13);
    updateDB("userProfile/1234/ssn", "044-123-4545");
    removeDB("userProfile/1234/age");
    expect(events[3].snap).to.haveOwnProperty("name");
    expect(events[3].snap).to.haveOwnProperty("ssn");
    expect(events[3].snap).to.not.haveOwnProperty("age");
    expect(events[3].snap.name).to.equal("Bob Marley");
  });

  it.only('listening on "on_child" events', async () => {
    const queryRef = new Query("userProfile", 10);
    let events = [];
    const cb = (eventType: string) => (snap: DataSnapshot, value: any) => {
      events.push({ snap: snap.val(), value, eventType });
      // console.log(`event [${eventType}]`, snap.key, snap.val(), value);
    };
    queryRef.on("child_added", cb("child_added"));
    queryRef.on("child_changed", cb("child_changed"));
    queryRef.on("child_removed", cb("child_removed"));

    updateDB("userProfile/abcd/name", "Bob Marley");
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).not.includes("child_added");
    events = [];
    updateDB("userProfile/p-tosh", { name: "Peter Tosh" });
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).includes("child_added");
    events = [];
    pushDB("userProfile", { "jane-doe": { name: "Jane Doe" } });
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).includes("child_added");
    events = [];
    setDB("userProfile/jjohnson", { name: "Jack Johnson", age: 45 });
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).includes("child_added");
    events = [];
    updateDB("userProfile/jjohnson/age", 99);
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).not.includes("child_added");
    events = [];
    removeDB("userProfile/p-tosh");
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).includes("child_removed");
    expect(events.map(e => e.eventType)).not.includes("child_added");
    events = [];
    pushDB("userProfile", { name: "Chris Christy" });
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).includes("child_added");
    events = [];
    setDB("userProfile/jjohnson/age", { name: "Jack Johnson", age: 88 });
    expect(events.map(e => e.eventType)).includes("child_changed");
    expect(events.map(e => e.eventType)).not.includes("child_added");
  });
});
