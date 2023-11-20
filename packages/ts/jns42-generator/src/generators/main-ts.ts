import * as models from "../models/index.js";
import { generateTypes } from "./types.js";
import { generateValidators } from "./validators.js";

export function* generateMainTsCode(specification: models.Specification) {
  yield* generateTypes(specification);
  yield* generateValidators(specification);
}
