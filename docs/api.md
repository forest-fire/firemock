![header](images/firemock-header.jpg)
# Firebase API {#top}

Up to now we've talk about the process of generating data for our mock database but just having a pile of data isn't that great. You'll want to **use** that data and how you'll want to use it is typically going to be using the existing Firebase API surface. Well fine sir/madame, that's exactly what we're providing.

## API Overview

Here's a pictorial diagram of the interfaces that Firebase exposes:

![api](images/firebase-api.jpg)

## Querying Firebase {#querying}

If you know how to query Firebase, then you largely know how to query the **firemock** API. Here's a simple example (we're putting this into a test where we're using the _mocha_ test runner and _chai_ grammer):

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


## Other Features {#other}

### Firebase IDs

Rather than putting in some random push-id string we use the very useful `firebase-key` library to create _time appropriate_ id's which very closely resemble the ID you'd get with the Firebase DB.

### Network Delay

By default the Firebase events return with a delay of 5ms but this number can be set by adjusting the `delay()` method:

````js
import Mock from 'firemock';
const m = new Mock();
m.delay(200);
````

From this point forward all requests will have a 200ms delay. You can also configure with a tuple which indicates the min/max delays. For example the following config will result in random delays between 10 and 100ms:

````js
m.delay([10,100]);
````

### Synchronous Querying
In general you'll want to use the asynchronous events that Firebase provides for changes but in some cases it might be useful to do synchronous queries. Firemock supports that through the following syntax:

````js
import Mock from 'firemock';
const m = new Mock();
m
  .addSchema('cat', fooMock)
  .queueSchema('cat', 50)
  .generate();
const results = m.ref('/cats').onceSync('value');
````

### Direct views into database
Querying as described above is the right way to test code since that's the way that you'll code against the actual Firebase DB but occationally it's useful to just look into the database and you can do this by utilizing the `db` property off of Mock class:

````js
import Mock from 'firemock';
const m = new Mock();
m
  .addSchema('cat', fooMock)
  .queueSchema('cat', 50)
  .generate();

console.log(m.db.cats);
````

The logging statement at the bottom will print out a JS hash of cats (who doesn't want that).

### Generic Type Goodness
Because this library is fully written in Typescript you can explore the API with the super useful intellisense popups from the comfort of your favorite editor. Stop pretending this isn't exciting. Ok, but beyond that there's an attempt to provide generic types throughout so that you can provide additional type safety if you wish to. For example, you can specify your typing for a schema like so:

````js
import Mock from 'firemock';
const m = new Mock();
m
  .addSchema<IAnimal>('cat', fooMock)
````

Now firemock will ensure that all generated cat's conform to the `IAnimal` interface. This can be useful to make sure your tests are indeed compliant with the types you've defined.