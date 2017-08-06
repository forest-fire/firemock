![header](images/firemock-header.jpg)

# Defining Schemas

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

### Next Up
Now, we're ready to move onto [Schema Generation](./generation.md).