import * as schemaIntermediateB from "@jns42/jns42-schema-intermediate-b";
import fs from "node:fs";
import path from "node:path";
import { NestedText, flattenNestedText } from "../utils/index.js";
import { generateMainTsCode } from "./main-ts.js";
import { getPackageJsonData } from "./package-json.js";
import { getTsconfigJsonData } from "./tsconfig-json.js";
import { generateTypesTsCode } from "./types-ts.js";
import { generateValidatorsTestTsCode } from "./validators-test-ts.js";
import { generateValidatorsTsCode } from "./validators-ts.js";

export interface PackageOptions {
  name: string;
  version: string;
  directoryPath: string;
}

export function generatePackage(
  intermediateData: schemaIntermediateB.SchemaJson,
  namesData: Record<string, string>,
  options: PackageOptions,
) {
  const specification = {
    names: namesData,
    nodes: intermediateData.schemas,
  };

  fs.mkdirSync(options.directoryPath, { recursive: true });

  {
    const data = getPackageJsonData(options.name, options.version);
    const filePath = path.join(options.directoryPath, "package.json");
    fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
  }

  {
    const data = namesData;
    const filePath = path.join(options.directoryPath, "names.json");
    fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
  }

  {
    const data = intermediateData;
    const filePath = path.join(options.directoryPath, "intermediate.json");
    fs.writeFileSync(filePath, JSON.stringify(data, undefined, 2));
  }

  {
    const data = getTsconfigJsonData();
    const filePath = path.join(options.directoryPath, "tsconfig.json");
    fs.writeFileSync(filePath, JSON.stringify(data));
  }

  {
    const code = generateMainTsCode(specification);
    const filePath = path.join(options.directoryPath, "main.ts");
    writeCodeToFile(filePath, code);
  }

  {
    const code = generateValidatorsTsCode(specification);
    const filePath = path.join(options.directoryPath, "validators.ts");
    writeCodeToFile(filePath, code);
  }

  {
    const code = generateTypesTsCode(specification);
    const filePath = path.join(options.directoryPath, "types.ts");
    writeCodeToFile(filePath, code);
  }

  {
    const code = generateValidatorsTestTsCode(specification);
    const filePath = path.join(options.directoryPath, "validators.test.ts");
    writeCodeToFile(filePath, code);
  }
}

function writeCodeToFile(filePath: string, code: NestedText) {
  const fd = fs.openSync(filePath, "w");

  try {
    for (const text of flattenNestedText(code)) {
      fs.writeFileSync(fd, text);
    }
  } finally {
    fs.closeSync(fd);
  }
}
