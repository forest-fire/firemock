import typescript from "rollup-plugin-typescript2";

export default {
  input: "src/index.ts",
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
      sourcemap: true,
      globals: {
        lodash: "lodash",
        "firebase-key": "fbKey",
        "typed-conversions": "convert"
      }
    }
  ],
  external: ["firebase-api-surface", "typed-conversions"],
  plugins: [
    typescript({
      tsconfig: "tsconfig.esnext.json"
    })
  ]
};
