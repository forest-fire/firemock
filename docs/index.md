# FireMock

> A mocking companion to your Firebase projects

## Why Care?

Besides your big heart? Well because mocking is an incredibly powerful tool for all sorts of testing scenarios and by using `firemock` -- optionally alongside one of the companion libraries mentioned in the [getting started](#getting-started) section -- it has never been easier.

Ok, now for a less crass answer. This library will help you:

1. Work off a database that responds to interaction just like a real Firebase RTDB
2. Create _fake_ data that -- while fake -- quickly resembles real production data; often much sooner than your project even has any real production data

The benefits of this hopefully are clear but one thing its worth saying is that this library is not a a traditional "mocking library" in the sense of [mockito](NagRock/ts-mockito: Mocking library for TypeScript), [typemoq](florinn/typemoq: A simple mocking library for TypeScript), or the old heavyweight [SinonJS](https://sinonjs.org/). This library should be seen as it's own thing but as _it's own thing_ it could easily be used in conjunction with these tools.

### Auth Mocking

As of recently (June 2019) we are adding the ability to mock some aspects of the Firebase `Auth` API. This can help your testing simulate more real-world scenearios without jumping through hoops. See the [Auth](/auth/) section for more. This functionality can be found proxied through the appropriate companion libraries as well.

## Getting Started

To install:

```sh
# npm
npm install --save firemock
# yarn
yarn add firemock
```

While you _can_ use this library by itself. Zero wrong with that; most of the author's real use comes from using it _with_ [**FireModel**](https://firemodel.info). Firemodel will give you the best mileage for your fake miles but another option are using it with either of:

- `abstracted-client` - a simple wrapper over the Firebase client SDK
- `abstracted-admin` - a simple wrapper over the Firebase admin SDK

For a full list of "companion libraries" just check us out at [Github](https://github.com/forest-fire).
