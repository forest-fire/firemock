export default {
  input: "dist/esnext/index.js",
  output: [
    {
      file: "dist/firemock.cjs.js",
      format: "cjs",
      name: "FireMock",
      sourcemap: true
    },
    {
      file: "dist/firemock.umd.js",
      format: "umd",
      name: "FireMock",
      sourcemap: true
      // globals: {
      //   lodash: "lodash",
      //   "firebase-key": "fbKey",
      //   "typed-conversions": "convert",
      //   "abstracted-firebase": "abstractedFirebase"
      // }
    }
  ],
  external: ["firebase-api-surface", "typed-conversions"]
};
