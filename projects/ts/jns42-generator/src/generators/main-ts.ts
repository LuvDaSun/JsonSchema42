import * as models from "../models/index.js";
import { banner, itt } from "../utils/index.js";

export function* generateMainTsCode(specification: models.Specification) {
  yield banner;

  yield itt`
    export * from "./types.js";
    export * from "./validators.js";
    export * from "./parsers.js";
  `;
}
