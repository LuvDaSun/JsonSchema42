import * as core from "@jns42/core";
import { packageInfo } from "../utilities.js";
import { itt } from "../utilities/iterable-text-template.js";

export function* generateBuildJsCode() {
  yield core.banner("//", `v${packageInfo.version}`);

  yield itt`
    import cp from "node:child_process";
  `;

  yield itt`
    const options = { shell: true, stdio: "inherit" };

    cp.execFileSync("tsc", ["--build"], options);
    cp.execFileSync("rollup", ["--config"], options);
  `;
}
