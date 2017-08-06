![header](images/firemock-header.jpg)

# Deployment API

The Deployment API has been created to help seed the database with good mock data for your tests. There are three stages to deployment:

1. Defining Schemas
2. Queuing Schemas for Deployment
3. Generating Mock Data

The last step is a one-liner so we will cover these topics in the following docs:

- [Defining Schemas](#schemas)
- [Generating Mock Data](#generation)

## Defining Schemas {#schemas}

If you want to seed your mocked database with reasonable mock data but not hand code it all in, you'll want to take advantage of "schemas" in **firemock**. In a nutshell, a schema is a way of describing a Javascript hash/dictionary which leverages the popular [faker](https://github.com/marak/Faker.js/) and [chance](http://chancejs.com/) libraries.

### An Example

Let's look an example that we'll use through this documentation ... we have a Pet Store which wants to keep track of _customers_, _pets_, and _appointments_. To setup a schema for this you might do something like this:

```js
import { Mock } from 'firemock';
const m = new Mock();
m.addSchema('customer', (h) => () => {
    first: h.faker.name.firstName(),
    last: h.faker.name.firstName(),
    email: h.chance.email(),
    address: h.chance.address()
  })
  .hasMany('pet');

m.addSchema('pet', (h) => () => {
    name: h.faker.name.firstName(),
    age: chance.integer({min: 1, max: 15}),
    gender: chance.gender()
  })
  .hasMany('appointment')
  .belongsTo('customer');

m.addSchema('appointment', (h) => () => {
    when: h.faker.date.future(),
    description: h.faker.random.words(),
  })
  .belongsTo('pet')
  .belongsTo('customer');
```

The example here shows the definition of "attributes" of each schema as well as establishing relationships that exist between schema entities.

## Generating Mock Data {#generation}

Now that we understand how to define _schemas_ we should turn our attention into leveraging these schemas to create data in our mock database. This is where generation comes in.

### A simple example

Before looking at the code, remember that we have now defined three schemas: pet, customer, and appointment.

```js
m.queueSchema('appointment', 25);
```

At this point we **still** don't have anything in the mock database but we have queued up what we want generated. The final step is:

```js
m.generate();
```

This creates 25 appointments for us. Simple example but it works. If you remember, an appointment _belongsTo_ to both a pet and a customer. Currently in our mock database, however, those references are not set. Let's fix that.

#### Adding _belongsTo_ fulfillment

Adding the _belongsTo_ relationship that exists between "pet" and "customer" is as simple as:

```js
m.queueSchema('appointment', 25)
  .fulfillBelongsTo('pet')
  .fulfillBelongsTo('customer');
m.generate();
```

Now in the database we have not only 25 appointments but each appointment has a valid Firebase "push Id" reference to the pet and customer associated. Because we've also told **firemock** how to represent these two external entities, not only are the push-key ID's included in the appointment but the pet and customer records with that push-key are also in the database. Cool!

#### Advanced Linking, Overrides, and _hasMany_ fulfillment

Now, let's assume that we have another test we want to support with data but this test is more concerned with the `pet` entity. In all likelihood, in the real world, this test would have a completely separate mocking setup but for demonstration purposes let's assume we're going to create mocking data for both tests. Here's what we'd add to our deployment logic:

````js
m.queueSchema('appointment', 25)
  .fulfillBelongsTo('pet')
  .fulfillBelongsTo('customer');

m.queueSchema('pet', 10)
  .quantifyHasMany('appointment', 5);

m.queueSchema('pet', 1, { name: 'Flopsy' });

m.generate();
````

This additional configuration has made a few notable changes:

- There are now 11 pet records queued for inclusion in the database
- The first 10 of these pets will receive a random name and be associated with 5 appointments
- The last pet -- Flopsy -- has her name set statically and because Flopsy is so damn healthy we have associated zero appointments.
- Finally, you may have noticed that while the `pet` schema has a _belongsTo_ relationship to `customer` we have not made reference to this in our deployment configuration (as opposed to what we did with `appointment`). This means that each pet will have a `customerId` record on it but it will be set to a blank string value.

### Database Path

You may have noticed that in the examples so far when we generate a schema it gets placed into the mock database off the root of the database and its name is the plural version of: 

  | schema | DB path |
  | :----: | :----- |
  | customer | /customers |  
  | pet | /pets |
  | appointment | /appointments |

This default makes sense for a lot of situations but clearly we will need some flexibilty to modify this in edge cases. This flexibility comes in several forms:


- **Base Offset**

- **Explicit Pluralization**

- **Models versus Schemas**

  In our MVC upbringing we're quick to assign meaning to the term "model" and while the above _schemas_ that we've defined may seem quite similar they are slightly abstracted from the "model" nominclature. This is the _default_ behavior and means that the following schemas are place the given paths:

