# Generating Data

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

### Models versus Schemas

In our MVC upbringing we're quick to assign meaning to the term "model" and while the above _schemas_ that we've defined may seem quite similar they are slightly abstracted from the "model" nominclature.