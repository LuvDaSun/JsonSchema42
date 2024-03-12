import replace from "@rollup/plugin-replace";
import path from "path";
import { defineConfig } from "rollup";

export default defineConfig([
  {
    external: [/.*/],
    input: path.resolve("transpiled", "main.js"),
    output: { file: path.resolve("bundled", "main.js"), format: "module", sourcemap: true },
    plugins: [
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify("production"),
        },
        preventAssignment: true,
      }),
    ],
  },
  {
    external: [/.*/],
    input: path.resolve("transpiled", "main.js"),
    output: { file: path.resolve("bundled", "main.cjs"), format: "commonjs", sourcemap: true },
    plugins: [
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify("production"),
          "import.meta.dirname": "__dirname",
        },
        preventAssignment: true,
      }),
    ],
  },
  {
    external: [/.*/],
    input: path.resolve("transpiled", "program.js"),
    output: { file: path.resolve("bundled", "program.js"), format: "module", sourcemap: true },
    plugins: [
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify("production"),
        },
        preventAssignment: true,
      }),
    ],
  },
]);
