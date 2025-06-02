import * as core from "@jns42/core";
import { packageInfo } from "../utilities.js";
import { itt } from "../utilities/iterable-text-template.js";

export function* generateCleanJsCode() {
  yield itt`
    #!/usr/bin/env node
  `;

  yield core.utilities.banner("//", `v${packageInfo.version}`);

  yield itt`
    import fs from "fs";
    import path from "path";
  `;

  yield itt`
    fs.rmSync(path.resolve("transpiled"), { recursive: true, force: true });
    fs.rmSync(path.resolve("typed"), { recursive: true, force: true });
    fs.rmSync(path.resolve("bundled"), { recursive: true, force: true });
  `;
}
