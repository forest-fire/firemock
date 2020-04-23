import "mocha";
import { expect } from "chai";
import { Mock } from "../../src/mocking";
import { adminAuthSdk } from "../../src";
import { initializeAuth, clearAuthUsers } from "../../src/auth/state-mgmt";
import { IDictionary } from "common-types";

describe("Admin Auth => ", async () => {
  beforeEach(async () => {
    clearAuthUsers();
  });

  it("using a direct import, primary functions are in place", async () => {
    hasExpectedFunctions(adminAuthSdk);
  });

  it("returned UserRecord has correct props when calling createUser", async () => {
    const m = await Mock.prepare();
    const auth = await m.auth();
    const admin = adminAuthSdk;
    const response = await admin.createUser({
      email: "test@test.com",
      disabled: false,
      displayName: "John Smith",
      emailVerified: true,
      uid: "1234",
      password: "foobar"
    });
    // UserRecord has correct props
    expect(response).to.be.an("object");
    expect(response.uid).to.equal("1234");
    expect(response.email).to.equal("test@test.com");
    expect(response.displayName).to.equal("John Smith");
    expect(response.disabled).to.equal(false);
  });

  it("creating a User allows the client API to use that user to login", async () => {
    const m = await Mock.prepare({ auth: { providers: ["emailPassword"] } });
    const auth = await m.auth();
    const admin = adminAuthSdk;
    await admin.createUser({
      email: "test@test.com",
      disabled: false,
      displayName: "John Smith",
      emailVerified: true,
      uid: "1234",
      password: "foobar"
    });

    const response = await auth.signInWithEmailAndPassword(
      "test@test.com",
      "foobar"
    );
    expect(response.user.uid).to.equal("1234");
    expect(response.user.email).to.equal("test@test.com");
    expect(response.user.emailVerified).to.equal(true);
    expect(response.user.displayName).to.equal("John Smith");
    expect(response.user.providerId);
  });

  it("using admin API ... can create, update, then delete two users; listing at every step", async () => {
    const admin = adminAuthSdk;
    await admin.createUser({
      email: "john@test.com",
      displayName: "John Smith",
      uid: "1234",
      password: "foobar"
    });
    await admin.createUser({
      email: "jane@test.com",
      displayName: "Jane Doe",
      uid: "4567",
      password: "foobar"
    });
    let users = await admin.listUsers();
    expect(users)
      .to.be.an("object")
      .and.have.ownProperty("users");
    expect(users.users).to.be.an("array");
    expect(users.users).to.have.lengthOf(2);
    let found = users.users.find(u => u.uid === "1234");
    expect(found).to.not.be.equal(undefined);
    expect(found.emailVerified).to.equal(false);

    // update
    await admin.updateUser("1234", {
      emailVerified: true
    });

    users = await admin.listUsers();
    found = users.users.find(u => u.uid === "1234");
    expect(found.emailVerified).to.equal(true);

    // remove one
    await admin.deleteUser("4567");
    users = await admin.listUsers();
    expect(users.users).to.have.lengthOf(1);

    // remove remaining
    await admin.deleteUser("1234");
    users = await admin.listUsers();
    expect(users.users).to.have.lengthOf(0);
  });
});

export function hasExpectedFunctions(api: IDictionary) {
  expect(api).to.have.property("createUser");
  expect(api).to.have.property("updateUser");
  expect(api).to.have.property("deleteUser");
  expect(api).to.have.property("getUserByEmail");
  expect(api).to.have.property("listUsers");
}
