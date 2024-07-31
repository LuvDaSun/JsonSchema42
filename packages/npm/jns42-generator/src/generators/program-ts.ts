import * as core from "@jns42/core";
import assert from "node:assert";
import * as models from "../models/index.js";
import { itt, packageInfo } from "../utils/index.js";

export function* generateProgramTsCode(
  specification: models.Specification,
  packageName: string,
  packageVersion: string,
  entryLocation: string,
) {
  const packageNameMatch = /^(?:(@[a-z][a-z0-9\-_\.]*?)\/)?([a-z][a-z0-9\-_\.]*)$/.exec(
    packageName,
  );

  if (packageNameMatch == null) {
    throw new Error("invalid package name");
  }

  const { names, typesArena } = specification;

  let entryKey: number;
  for (entryKey = 0; entryKey < typesArena.count(); entryKey++) {
    const item = typesArena.getItem(entryKey);
    if (item.location === entryLocation) {
      break;
    }
  }

  const entryTypeName = names.getName(entryKey);

  assert(entryTypeName != null);

  const parseFunction = "parse" + entryTypeName.toPascalCase();
  const validatorFunction = "is" + entryTypeName.toPascalCase();

  yield itt`
    #!/usr/bin/env node
  `;

  yield core.banner("//", `v${packageInfo.version}`);

  yield itt`
    import * as consumers from "node:stream/consumers";
    import YAML from "yaml";
    import { hideBin } from "yargs/helpers";
    import yargs from "yargs/yargs";
    import * as validators from "./validators.js";
    import * as parsers from "./parsers.js";
  `;

  yield itt`
    const program = yargs(hideBin(process.argv));
  
    program.scriptName(${JSON.stringify(packageNameMatch[2])});
    program.version(${JSON.stringify(packageVersion)});
    program.demandCommand();

    program.command(
      "assert",
      "asserts JSON or YAML from stdin",
      yargs => yargs.
        option("parse", {
          description: "parse the data before asserting",
          type: "boolean",
        }),
      async argv => {
        const stdinData = await consumers.text(process.stdin);
        let data = YAML.parse(stdinData);
        if(argv.parse) {
          data = parsers.${parseFunction}(data);
        }
        if(!validators.${validatorFunction}(data)) {
          const lastError = validators.getLastValidationError();
          console.error(\`Invalid data, "\${lastError.rule}" violated in "\${lastError.path}" for type "\${lastError.typeName}".\`);
          process.exit(1);
        }
      },
    );

    await program.parseAsync();
  `;
}
