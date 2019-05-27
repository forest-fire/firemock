# Other Features

## Firebase IDs

Rather than putting in some random push-id string we use the very useful `firebase-key` library to create _time appropriate_ id's which very closely resemble the ID you'd get with the Firebase DB.

## Initializing Database State

By default your mock database will start out empty and you're expected to create, queue, and generate schemas to get a good test data state. However, sometimes it's useful to start the database with a known state and that is possible when using the constructor of the Mock class:

```js
const m = new Mock({
  monkeys: {
    a: { name: "abbey" },
    b: { name: "bobby" },
    c: { name: "cindy" }
  }
});
```

Furthermore, at any point you can also add in more state with:

```js
m.updateDB({
  monkeys: {
    a: { name: "abbey" },
    b: { name: "bobby" },
    c: { name: "cindy" }
  }
});
```

## Network Delay

By default the Firebase events return with a delay of 5ms but this number can be set by adjusting the `delay()` method:

```js
import Mock from "firemock";
const m = new Mock();
m.setDelay(200);
```

From this point forward all requests will have a 200ms delay. You can also configure with a tuple which indicates the min/max delays. For example the following config will result in random delays between 10 and 100ms:

```js
m.setDelay([10, 100]);
```

## Direct views into database

Querying as described above is the right way to test code since that's the way that you'll code against the actual Firebase DB but occationally it's useful to just look into the database and you can do this by utilizing the `db` property off of Mock class:

```js
import Mock from "firemock";
const m = new Mock();
m.addSchema("cat", fooMock)
  .queueSchema("cat", 50)
  .generate();

console.log(m.db.cats);
```

The logging statement at the bottom will print out a JS hash of cats (who doesn't want that).

## Resetting Mock Database

The mock database is a singleton which will continue to grow in records -- and listeners -- for the duration of your testing run. In many cases you may want to reset the database (this clears data and all listeners). Let's say you instead wanted each test to run with a fresh database, you could achieve that with:

```ts
describe("my tests", () => {
  const m = new Mock();
  beforeEach(() => {
    m.resetDatabase();
  });

  it("test something");
  it("test something else");
});
```

## Advanced Type Goodness

Because this library is fully written in Typescript you can explore the API with the super useful intellisense popups from the comfort of your favorite editor. Stop pretending this isn't exciting. Ok, but beyond that there's an attempt to provide generic types throughout so that you can provide additional type safety if you wish to. For example, you can specify your typing for a schema like so:

```js
import Mock from "firemock";
const m = new Mock();
m.addSchema < IAnimal > ("cat", fooMock);
```

Now firemock will ensure that all generated cat's conform to the `IAnimal` interface. This can be useful to make sure your tests are indeed compliant with the types you've defined.
