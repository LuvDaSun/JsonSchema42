import ts from "typescript";
import * as models from "../models/index.js";
import { TypesTsCodeGenerator } from "./types-ts.js";
import { ValidatorsTsCodeGenerator } from "./validators-ts.js";

export function* generateMainTsCode(specification: models.Specification) {
  const { names, nodes } = specification;
  const { factory } = ts;

  {
    const codeGenerator = new TypesTsCodeGenerator(factory, names, nodes);
    yield* codeGenerator.getCode();
  }

  {
    const codeGenerator = new ValidatorsTsCodeGenerator(factory, names, nodes);
    yield* codeGenerator.getCode();
  }
}
