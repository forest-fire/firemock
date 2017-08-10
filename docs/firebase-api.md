###### &nbsp; {#top}
![header](images/firemock-header.jpg) 
# Firebase API 

Where the Deployment API was primarily concerned with _seeding_ you mock database with a proper set of test data, the **Firebase API** focuses on _interacting_ with your data exactly as you're used to when using a Firebase backend.

## API Overview

Here's a pictorial diagram of the interfaces that **Firebase** _and_ **firemock** expose:

![api](images/firebase-api.jpg)

## Querying Firebase {#querying}

If you know how to query Firebase, then you know how to query the **firemock** API. In a "realtime database" like Firebase we use either the traditional "request/reply" interaction used in most other databases or we can instead have the database notify us of changes we are interested in real time using an event model. In this section we'll cover the more standard interaction model but we'll get to event-driven interaction in the [real-time](#realtime) section later.

Here's a simple example :

```js
it('test something about appointments', done => {
  // ... setup data ...
  m.ref('/appointments')
    .once('value')
    .then(snap => {
      expect(snap.val()).is.an('object');
      expect(snap.key).is.equal('appointments');
      expect(snap.numChildren()).is.equal(25);
      done();
    });
});
```

> Note: we're putting this into a test where we're using the _mocha_ test runner and _chai_ grammer ... these are popular choices but obviously it will work in any testing framework

Let's walk through the example:

- the `[mock].ref()` call gives the Firebase "reference" API surface
- we use the `once` event to asynchronously query the database for the path "/appointments" (a promise is returned)
- `snap.val()` returns a JS hash of appointments keyed by push-id
- `snap.key` is not very interesting in this case but represents the query's root node
- `snap.numChildren()` just gives us the number of children that this DB path has; from our prior examples 25 is the number we'd expect

Cool but basic. What if we wanted to test for appointments scheduled in the next week?

### Filtering a Query

```js
import * as moment from 'moment';
it('appointments in the next week should exist', done => {
  // ... setup data ...
  m.ref('/appointments')
    .startAt(moment().toISOString(), 'when')
    .endAt(moment().add(7, 'days').toISOString(), 'when')
    .once('value')
    .then(snap => {
      expect(snap.val()).is.an('object');
      expect(snap.key).is.a('string');
      expect(snap.numChildren()).is.equal(x);
      done();
    });
});
```

So now you start to see that filters like startAt, endAt, and equalTo are usable in exactly the same way you use them when going back to the Firebase DB.

## Writing to the Database {#writing}

When we started talking about _schemas_ and _generation_, this was in essence a bulk way of writing data to the database. While this is typically done for initializing "state" into a desireable starting point it is not useful for testing Firebase code as this is not represented in Firebase's API. 

For those of you Firebase ace's the API endpoints we are concerned about when writing to the database include operations such as: `set()`, `update()`, `push()`, and `remove()`. A simple example of this might fall along these lines:

```js
const m = new Mock();

before(async () => {
  m.addSchema('customer', (h) => () => {
    first: h.faker.name.firstName(),
    last: h.faker.name.firstName(),
    email: h.chance.email(),
    address: h.chance.address()
  });
  m.queueSchema('customer', 10);
  m.generate();
});

it('pushing a new customer works', async () => {
  await m.ref('customers').push({
    first: 'John',
    last: 'Smith',
    email: 'john.smith@acme.com'
  });
  const customers = await m.ref('customers').once('value');
  expect(customers.numChildren).to.equal(11);
}
```

This test isn't the best but hopefully it illustrates the use of the write-based `push` API used to push a new customer record into the mock database.

## Real-time Events {#realtime}

In the _querying_ section above we saw a traditional interaction between code and database ... the code queried for something in the database with the `once()` method and got back a result as a one time data snapshot. That's the way most databases work but as we know Firebase is different.

Rather than relying on `once()` to do our bidding in the traditional request-response style we instead state our _interest_ in data paths and let Firebase tell us when they've changed. You know the drill. Here's an example of how this might appear in a test:

```js
const m = new Mock();

before(async () => {
  m.addSchema('customer', (h) => () => {
    first: h.faker.name.firstName(),
    last: h.faker.name.firstName(),
  });
  m.queueSchema('customer', 10);
  m.generate();
});

it('pushing a new customer works', (done) => {
  const onChildAdded = (snap) => {
    expect(snap.numChildren).to.equal(11);
    done();
  };
  m.ref('customers').on('child_added', onChildAdded);
  m.ref('customers').push({ first: 'John', last: 'Smith' });
}
```
