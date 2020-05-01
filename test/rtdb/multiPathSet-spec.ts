import "mocha";
import { expect } from "chai";
import { Mock } from "../../src/mocking";

describe("multiPathSet() => ", () => {
  it("setting properties shallowly works as expected", async () => {
    const m = await Mock.prepare();
    m.ref("/").update({
      "/baz": 1,
      "/bar": 2,
      "/foo/baz": 5,
    });
    expect(m.db.baz).to.equal(1);
    expect(m.db.bar).to.equal(2);
    expect(m.db.foo).to.be.an("object");
    expect(m.db.foo.baz).to.equal(5);
  });

  it("setting properties deeply ", async () => {
    const m = await Mock.prepare();
    m.ref("/").update({
      "/foo/bar/foo": 1,
      "/foo/bar/bar": 2,
      "/foo/bar/baz": 5,
    });
    expect(m.db.foo.bar.foo).to.equal(1);
    expect(m.db.foo.bar.bar).to.equal(2);
    expect(m.db.foo.bar.baz).to.equal(5);
  });

  it("explicit paths are set destructively but neighboring properties are left untouched", async () => {
    const m = await Mock.prepare({
      db: {
        foo: {
          bar: {
            white: true,
            brown: true,
            green: false,
            red: true,
          },
        },
      },
    });
    m.ref("/").update({
      "/foo/bar/added": true,
      "/foo/bar/white": false,
    });
    expect(m.db.foo.bar.added).is.equal(true);
    expect(m.db.foo.bar.white).is.equal(false);
    expect(m.db.foo.bar.green).is.equal(false);
    expect(m.db.foo.bar.red).is.equal(true);
  });
});
