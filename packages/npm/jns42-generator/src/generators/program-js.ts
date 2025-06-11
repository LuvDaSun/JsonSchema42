import * as core from "@jns42/core";
import { itt, readPackageInfo } from "../utilities.js";

export function* generateProgramJsCode() {
  const packageInfo = readPackageInfo();

  yield itt`
    #!/usr/bin/env node
  `;

  yield core.banner("//", `v${packageInfo.version}`);

  yield itt`
    import "../bundled/program.js";
  `;
}
