# Mocking directory

This directory hosts the source for creating _mocking_ of data which is fully separate from
the `rtdb` and `firestore` directories which focus on standing up an in-memory mock database.

These two interests come together because when you are using a _mocked_ database you will likely
want to have an efficient way to create mock data for your database to test with. Note, however, 
that this mocking function can also be very useful for creating a "seed" of known data for a 
real database too.

## Dependencies

The mocking function relies heavily on the `faker` library to produce fake data and this dependency 
is not small so attempt have been made to ensure that if you're using this library via **ES modules**
that you only import it when you need it and that it is imported asynchronously.

### Side note on Async Loading

Async loading of dependencies works well for Webpack driven build processes for the frontend because it
automatically separates bundles and loads them only when needed at runtime. This can, however, cause
problems if you are using AWS Lambda functions and need to access the **faker** library as webpack will
produce a separate bundle for it but depending on your build process this bundle might not be sent
up to Lambda. This is just meant as a quick note to let people know that this _might_ happen (though in 
most cases you won't need or want Faker in a serverless lambda environment).