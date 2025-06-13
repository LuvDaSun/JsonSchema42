import * as core from "@jns42/core";
import { readPackageInfo } from "../utilities.js";
import { itt } from "../utilities/iterable-text-template.js";

export function* generateBuildJsCode() {
  const packageInfo = readPackageInfo();

  yield core.utilities.banner("//", `v${packageInfo.version}`);

  yield itt`
    import cp from "node:child_process";
    import path from "node:path";
  `;

  yield itt`
    const options = { stdio: "inherit", env: process.env };

    cp.execFileSync("tsc", [], options);
    cp.execFileSync("rollup", ["--config", path.resolve("rollup.config.js")], options);
  `;
}
