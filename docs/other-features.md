###### &nbsp; {#top}
![header](images/firemock-header.jpg) 

# Other Features

### Firebase IDs {#firebase-ids}

Rather than putting in some random push-id string we use the very useful `firebase-key` library to create _time appropriate_ id's which very closely resemble the ID you'd get with the Firebase DB.

### Network Delay {#network}

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

### Direct views into database {#view-db}
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

### Synchronous Querying {#synchronous}
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

### Generic Type Goodness {#typing}
Because this library is fully written in Typescript you can explore the API with the super useful intellisense popups from the comfort of your favorite editor. Stop pretending this isn't exciting. Ok, but beyond that there's an attempt to provide generic types throughout so that you can provide additional type safety if you wish to. For example, you can specify your typing for a schema like so:

````js
import Mock from 'firemock';
const m = new Mock();
m
  .addSchema<IAnimal>('cat', fooMock)
````

Now firemock will ensure that all generated cat's conform to the `IAnimal` interface. This can be useful to make sure your tests are indeed compliant with the types you've defined.