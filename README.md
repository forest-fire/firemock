[![Build Status](https://travis-ci.org/forest-fire/firemock.svg?branch=master)](https://travis-ci.org/forest-fire/firemock.svg?branch=master) [![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

# firemock
> Firebase, Typescript, and mocking ... what more could you ask for?

## Overview

This Typescript library is meant to serve as a type-aware solution for node developers using a Firebase backend. The functional overview consists of:

1. Generate mock data -- with Firebase conventions -- for testing
2. Provide an in-memory database/data structure to store this mock data for testing durations
3. Provide a Firebase [API surface](https://firebase.google.com/docs/reference/js/firebase.database.Reference) for querying the in-memory database

It's worth pointing out that this library _does not_ do the typical mock/spy types of tracking that you get with frameworks like _sinon_ or _test-double_ in JS and/or _ts-mokito_ or _typemoq_ in TS. If that's what you want then use one of these already existing solutions.
## Installation

To start using, simply type one of the following into your terminal window at the root of the project:

```sh
# npm
npm install --save-dev firemock
# yarn
yarn add --dev firemock
```

## Documentation

The documentation is hosted on Gitbook, point your browser to: [documentation](https://forest-fire.gitbooks.io/firemock/content)

## Contribution: PRs and Issues

I have developed this for my own needs but as with all my other open-source work I'd be happy to recieve PR's and issues. Not surprisingly, PR's are my preference but sometimes people don't feel they have the right skills or time to fix something they feel is broken so raising issues is a nice way to communicate something you've noticed. I can't promise issues will always get immediate attention but I will get back as soon as I can. 

## License

Copyright (c) 2017 LifeGadget Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

----

Now in the database we have not only 25 appointments but each appointment has a valid Firebase pushId reference to the `pet` and `customer` associated. Because we've also told Firemock how to represent these two external entities, not only are the push-key ID's included in the appointment but the `pet` and `customer` records with that push-key are also in the database.

Now, let's assume that we have another test we want to support with data but this test is more concerned with the `pet` entity. In all likelihood, in the real world, this test would have a completely separate mocking setup but for demonstration purposes let's assume we're going to create mocking data for both tests. Here's what we'd add to our deployment logic:

````js
m.queueSchema('appointment', 25)
  .fulfillBelongsTo('pet')
  .fulfillBelongsTo('customer');

m.queueSchema('pet', 10)
  .quantifyHasMany('appointment', 5);

m.queueSchema('pet', 1, { name: 'Flopsy' })
````

This additional configuration has made a few notable changes:

- There are now 11 pet records queued for inclusion in the database
- The first 10 of these pets will receive a random name and be associated with 5 appointments
- The last pet -- Flopsy -- has her name set statically and because Flopsy is so damn healthy we have associated zero appointments.
- Finally, you may have noticed that while the `pet` schema has a _belongsTo_ relationship to `customer` we have not made reference to this in our deployment configuration (as opposed to what we did with `appointment`). This means that each pet will have a `customerId` record on it but it will be set to a blank string value.

We're almost done with deployment configuration. Just one last thing to do:

````
m.generate();
````
This will push all the queued configuration into the database.

### Querying the data

Up to now we've been creating useful data for our tests. Great, so how do we use it? Simple ... we leverage the same API surface that Firebase provides through it's **Reference** and **Snapshot** API's. Continuing on from our example above, say I wanted to test something about the list of appointments in the database:

````js
it('test something about appointments', done => {
  // ... setup data ...
  m.ref('/appointments')
    .once('value')
    .then(snap => {
      expect(snap.val()).is.an('object');
      expect(snap.key).is.a('string');
      expect(snap.numChildren()).is.equal(25);
      done();
    });
});
````

Cool but basic. What if we wanted to test for appointments scheduled in the next week?

````js
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
````

Cooler. So now you start to see that filters like `startAt`, `endAt`, and `equalTo` are usable in exactly the same way you use them when going back to the Firebase DB. This is no accident of course. The goal is to provide a drop-in replace for the `ref()` operator which allows for your tests to be isolated to the mocked test environment you've created. 

## Other Features

### Firebase IDs
Rather than putting in some random push-id string we use the very useful `firebase-key` library to create _time appropriate_ id's which very closely resemble the ID you'd get with the Firebase DB.

### Network delay

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