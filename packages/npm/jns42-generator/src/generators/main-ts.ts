import { banner } from "@jns42/core";
import * as models from "../models/index.js";
import { itt, packageInfo } from "../utils/index.js";

export function* generateMainTsCode(specification: models.Specification) {
  yield banner("//", `v${packageInfo.version}`);

  yield itt`
    export * from "./types.js";
    export * from "./validators.js";
    export * from "./parsers.js";
    export * from "./mocks.js";
  `;
}
