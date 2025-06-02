import * as core from "@jns42/core";
import * as models from "../models.js";
import { itt, packageInfo } from "../utilities.js";

export function* generateMainTsCode(specification: models.Specification) {
  yield core.utilities.banner("//", `v${packageInfo.version}`);

  yield itt`
    export * as types from "./types.js";
    export * as validators from "./validators.js";
    export * as parsers from "./parsers.js";
    export * as mocks from "./mocks.js";

    export * as lib from "@jns42/lib";
  `;
}
