import { CodeGeneratorBase } from "./code-generator-base.js";
import { TypesTsCodeGenerator } from "./types-ts.js";
import { ValidatorsTsCodeGenerator } from "./validators-ts.js";

export class MainTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    const { factory: f } = this;

    {
      const codeGenerator = new TypesTsCodeGenerator(f, this.names, this.nodes);
      yield* codeGenerator.getStatements();
    }

    {
      const codeGenerator = new ValidatorsTsCodeGenerator(
        f,
        this.names,
        this.nodes,
      );
      yield* codeGenerator.getStatements();
    }
  }
}
