import * as core from "@jns42/core";
import { itt, packageInfo } from "../utilities.js";

export function* generateRollupConfigJsCode() {
  yield core.banner("//", `v${packageInfo.version}`);

  yield itt`
    import path from "path";
    import { defineConfig } from "rollup";
  `;

  yield itt`
    const external = (id, parent, resolved) => !(id.startsWith(".") || path.isAbsolute(id));

    export default defineConfig([
      {
        external,
        input: path.resolve("transpiled", "main.js"),
        output: { file: path.resolve("bundled", "main.js"), format: "module", sourcemap: true },
        context: "global",
        plugins: [],
      },
      {
        external,
        input: path.resolve("transpiled", "main.js"),
        output: { file: path.resolve("bundled", "main.cjs"), format: "commonjs", sourcemap: true },
        context: "global",
        plugins: [],
      },
      {
        external,
        input: path.resolve("transpiled", "program.js"),
        output: { file: path.resolve("bundled", "program.js"), format: "module", sourcemap: true },
        context: "global",
        plugins: [],
      },
    ]);
  `;
}
