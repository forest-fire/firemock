# Deployment API

The Deployment API has been created to help seed the database with good mock data for your tests. There are three steps to deployment:

1. **Defining** Schemas
2. **Queuing** Schemas for Deployment
3. **Generating** Mock Data

Generation is a _one-liner_ but we will cover the first two topics in the following docs:

- [Defining Schemas](#defining-schemas)
- [Generating Mock Data](#generation)

## Defining Schemas

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
    age: h.faker.random.integer({min: 1, max:15})    ,
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

In the examples above, the mocking function is inline and as a result the variable `h` is known to be of type `SchemaHelper` which provides the  convenience intellisense for both faker and chance API's. However, it's often nice to define the mocking function externally to the `addSchema` call, here's an example of how you might do that and continue to get intellisense: 

```ts
import { Mock, SchemaCallback } from 'firemock';

const personMock: SchemaCallback = (h) => () => ({
  name: h.faker.name.firstName + ' ' + h.faker.name.lastName,
  age: h.faker.random.number( {min: 1, max: 80} )
});
```

You can also go a step further and make explicit the data structure that your callback will produce with:

```ts
import { Mock, SchemaCallback } from 'firemock';

export interface IPerson {
  name: string;
  age: number;
}

const personMock: SchemaCallback<IPerson> = (h) => () => ({
  name: h.faker.name.firstName + ' ' + h.faker.name.lastName,
  age: h.faker.random.number( {min: 1, max: 80} )
});
```

Now if you add a property that doesn't belong, miss one that is required, put in as the wrong type, etc. ... you'll be immediately told that your generator callback is _not_ in line with the interface.

## Generating Mock Data

Now that we understand how to define _schemas_ we should turn our attention into leveraging these schemas to create data in our mock database. This is where _queuing_ and _generation_ comes in.

### A simple example

Let's assume that for our tests we need some appointments in the database, we can achieve that with:

```js
m.queueSchema('appointment', 25);
```

At this point we **still** don't have anything in the mock database but we have _queued up_ what we want generated. The final step is:

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

  |   schema    | DB path       |
  | :---------: | :------------ |
  |  customer   | /customers    |
  |     pet     | /pets         |
  | appointment | /appointments |

This default makes sense for a lot of situations but we will need some flexibilty to modify this for edge cases. This flexibility is provided in several forms:


- **Base Offset**

  There are often cases where you want your schema to not reside directly off the root of the database. In these cases we can leverage the `pathPrefix()` configuration to ensure the offset is produced at "generation". An example might be that appointments are only available to authenticated users and to simplify your DB permissions you've decided that all schema/models which require authentication should be situated off the `/authorized` path:

  ```js
  m.addSchema('appointment', apptMock).pathPrefix('authorized');
  ```

- **Explicit Pluralization**

  **firemock** has a simple pluralization engine which takes the singular name of your schema and pluralizes it. It does get it right more often than not but doesn't account for all exceptions so if you ever need to you can explicitly state the pluralization by:

  ```js 
  m.addSchema('covfefe', mock).pluralName('absurdities');
  ```

- **Models versus Schemas**

  In `firemock` "schemas" are a formula that can generate model records. When we queue schemas and then run `generate`()` these schema definitions are converted to "models" in the database. Typically the schemas _name_ serves as a good name for the model too and if nothing is stated to the contrary then the DB's path will have the pluralised schema name as the terminal part of the DB path. If, however, you want to build two schema -- let's say "cats" and "dogs" -- and deploy them both to "animals" in the database, you could do that by:

  ```js
  m.addSchema('cat', catMock).modelName('animal');
  m.addSchema('dog', dogMock).modelName('animal');
  m.queueSchema('cat', 10);
  m.queueSchema('dog', 10);
  m.generate();
  ```

If you were to look into the database you'd see that there is no `/cats` or `/dogs` paths but there is an `/animals` path which has 20 records in it.
