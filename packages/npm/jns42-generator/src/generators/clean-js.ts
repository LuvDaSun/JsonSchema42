import { banner } from "@jns42/core";
import { packageInfo } from "../utils/index.js";
import { itt } from "../utils/iterable-text-template.js";

export function* generateCleanJsCode() {
  yield itt`
    #!/usr/bin/env node
  `;

  yield banner("//", `v${packageInfo.version}`);

  yield itt`
    import fs from "fs";
    import path from "path";
  `;

  yield itt`
    fs.rmSync(path.resolve("transpiled"), { recursive: true, force: true });
    fs.rmSync(path.resolve("types"), { recursive: true, force: true });
    fs.rmSync(path.resolve("bundled"), { recursive: true, force: true });
  `;
}
