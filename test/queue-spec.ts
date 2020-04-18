// tslint:disable:no-implicit-dependencies
import "mocha";
import * as chai from "chai";
import { Queue } from "../src/mocking";

const expect = chai.expect;

describe("Queue Class", () => {
  it("can instantiate", () => {
    const q = new Queue("testing");
  });

  it("simple queue can add items", () => {
    const q = new Queue("testing");
    q.clear()
      .enqueue("foo")
      .enqueue("bar")
      .enqueue("baz");
    expect(q.length).to.equal(3);
  });

  it("simple queue can enqueue and dequeue items", () => {
    const q = new Queue("testing");
    q.clear()
      .enqueue("foo")
      .enqueue("bar")
      .enqueue("baz");
    q.dequeue("bar");
    expect(q.length).to.equal(2);
    expect(q.includes("foo")).to.equal(true);
    expect(q.includes("bar")).to.equal(false);
  });

  it("simple queue can NOT use the push() method", () => {
    const q = new Queue("no-push").clear();
    try {
      q.push("foo");
      expect(false).to.equal(true);
    } catch (e) {
      expect(true).to.equal(true);
    }
  });

  it("object queue can add items", () => {
    const q = new Queue("testing");
    q.clear()
      .enqueue({ id: 1, value: "foo" })
      .enqueue({ id: 2, value: "bar" })
      .enqueue({ id: 3, value: "baz" });
    expect(q.length).to.equal(3);
  });

  it("object queue can push() items onto the queue", () => {
    const q = new Queue("no-push").clear();
    const key = q.push({ value: 123, foo: "bar" });
    expect(q.find(key).value).to.equal(123);
  });

  it("object queue can enqueue and dequeue items", () => {
    const q = new Queue("testing");
    q.clear()
      .enqueue({ id: 1, value: "foo" })
      .enqueue({ id: 2, value: "bar" })
      .enqueue({ id: 3, value: "baz" });
    q.dequeue(2);
    expect(q.length).to.equal(2);
    expect(q.includes(1)).to.equal(true);
    expect(q.includes(2)).to.equal(false);
  });

  it("queue is a singleton", () => {
    const q = new Queue("singleton");
    const q2 = new Queue("singleton");
    q.clear()
      .enqueue("foo")
      .enqueue("bar");
    expect(q2.length).to.equal(2);
    expect(q2.includes("foo")).to.equal(true);
  });

  it("separate queues remain separate", () => {
    const q = new Queue("first");
    const q2 = new Queue("second");
    q.clear()
      .enqueue("foo")
      .enqueue("bar");
    q2.clear()
      .enqueue("uno")
      .enqueue("dos");
    expect(q.length).to.equal(2);
    expect(q2.length).to.equal(2);
    expect(q.includes("foo")).to.equal(true);
    expect(q2.includes("dos")).to.equal(true);
  });

  it("can assign the queue a new value with fromArray()", () => {
    const q = new Queue("from-array").fromArray([
      { id: "foo", value: 5 },
      { id: "bar", value: 10 },
      { id: "baz", value: 20 }
    ]);

    expect(q.length).to.equal(3);
    expect(q.includes("foo")).to.equal(true);
    expect(q.includes("nada")).to.equal(false);
    expect(q.find("foo").value).to.equal(5);
  });

  it("can map over queue items, returning an array", () => {
    const q = new Queue("testing");
    const newQ = new Queue("newbie");
    newQ.fromArray(
      q
        .clear()
        .enqueue({ id: "foo", value: 5 })
        .enqueue({ id: "bar", value: 10 })
        .enqueue({ id: "baz", value: 20 })
        .map(i => {
          return { ...i, ...{ value: i.value + 1 } };
        })
    );

    expect(newQ.find("foo").value).to.equal(6);
    expect(newQ.find("bar").value).to.equal(11);
  });

  it("can filter() queue items, returning a JS array", () => {
    const q = new Queue("testing");
    const newQ = new Queue("newbie").clear();
    newQ.fromArray(
      q
        .clear()
        .enqueue({ id: "bear", type: "animal", value: 5 })
        .enqueue({ id: "dog", type: "animal", value: 10 })
        .enqueue({ id: "carrot", type: "produce", value: 20 })
        .filter(i => {
          return i.type === "animal";
        })
    );

    expect(newQ.length).to.equal(2);
    expect(newQ.find("bear").value).to.equal(5);
    expect(newQ.indexOf("carrot")).to.equal(-1);
  });

  it("toHash() on empty queue returns empty object", () => {
    const q = new Queue("empty").clear();
    expect(q.toHash()).to.be.an("object");
    expect(Object.keys(q.toHash()).length).to.equal(0);
  });

  it('toHash() for simple queue returns keys set to "true"', () => {
    const q = new Queue("from-array").fromArray([
      { id: "foo", value: 5 },
      { id: "bar", value: 10 },
      { id: "baz", value: 20 }
    ]);
    expect(q.toHash()).to.be.an("object");
    expect(q.toHash().foo).to.be.an("object");
    expect(q.toHash().foo.value).to.equal(5);
    expect(q.toHash().foo.id).to.equal(undefined);
    expect(q.toHash().uno).to.equal(undefined);
  });

  it("toHash() for object queue returns hash keyed on pkProperty", () => {
    const q = new Queue("from-array").fromArray(["foo", "bar", "baz"]);
    expect(q.toHash()).to.be.an("object");
    expect(q.toHash().foo).to.equal(true);
    expect(q.toHash().uno).to.equal(undefined);
  });

  it("find() and indexOf() find an known id in the queue", () => {
    const q = new Queue("from-array").fromArray([
      { id: "foo", value: 5 },
      { id: "bar", value: 10 },
      { id: "baz", value: 20 }
    ]);

    expect(q.find("foo").value).is.equal(5);
    expect(q.find("baz").value).is.equal(20);
    expect(q.indexOf("foo")).is.equal(0);
    expect(q.indexOf("baz")).is.equal(2);
  });

  it("replace() replaces an existing item in the queue", () => {
    const q = new Queue("replace").clear().fromArray([
      { id: "foo", value: 5 },
      { id: "bar", value: 10 },
      { id: "baz", value: 20 }
    ]);
    q.replace("foo", { value: 16, foo: "bar" });

    expect(q.find("foo").value).is.equal(16);
    expect(q.find("foo").foo).is.equal("bar");
  });

  it("update() updates an existing item in the queue", () => {
    const q = new Queue("replace").clear().fromArray([
      { id: "foo", value: 5 },
      { id: "bar", value: 10 },
      { id: "baz", value: 20 }
    ]);
    q.update("foo", { foo: "bar" });

    expect(q.find("foo").value).is.equal(5);
    expect(q.find("foo").foo).is.equal("bar");
  });

  it("update() on a non-existing item results in the new item being added", () => {
    const q = new Queue("replace").clear().fromArray([
      { id: "foo", value: 5 },
      { id: "baz", value: 20 }
    ]);
    q.update("bar", { value: 50 });

    expect(q.find("bar").value).is.equal(50);
  });
});
