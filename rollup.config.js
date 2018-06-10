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
    }
  ],
  external: ["firebase-api-surface", "typed-conversions"]
};
