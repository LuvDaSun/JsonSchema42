import * as models from "../models/index.js";
import { banner, itt } from "../utils/index.js";
import { PackageConfiguration } from "./package.js";

export function* generateMainTsCode(
  specification: models.Specification,
  configuration: PackageConfiguration,
) {
  yield banner;

  yield itt`
    export * from "./types.js";
    export * from "./validators.js";
    export * from "./parsers.js";
    export * from "./mocks.js";
  `;
}
