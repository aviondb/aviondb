// rollup.config.js
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import externals from "rollup-plugin-node-externals";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "esm",
    },
  ],
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    externals(),
    json(),
    typescript({
      rollupCommonJSResolveHack: true,
    }),
    commonjs({
      dynamicRequireTargets: ["node_modules/orbit-db/**/*.js"],
    }),
  ],
};
