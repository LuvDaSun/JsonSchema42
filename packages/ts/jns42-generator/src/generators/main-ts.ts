import * as models from "../models/index.js";
import { itt } from "../utils/index.js";

export function* generateMainTsCode(specification: models.Specification) {
  yield itt`
    export * from "./types.js";
    export * from "./validators.js";
  `;
}
