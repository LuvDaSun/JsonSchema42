import * as schemaIntermediateB from "@jns42/jns42-schema-intermediate-b";
import fs from "node:fs";
import path from "node:path";
import { NestedText, banner, flattenNestedText } from "../utils/index.js";
import { generateMainSpecTsCode } from "./main-test-ts.js";
import { generateMainTsCode } from "./main-ts.js";
import { getPackageJsonData } from "./package-json.js";
import { getTsconfigJsonData } from "./tsconfig-json.js";

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
    fs.writeFileSync(filePath, JSON.stringify(data));
  }

  {
    const data = namesData;
    const filePath = path.join(options.directoryPath, "names.json");
    fs.writeFileSync(filePath, JSON.stringify(data));
  }

  {
    const data = intermediateData;
    const filePath = path.join(options.directoryPath, "intermediate.json");
    fs.writeFileSync(filePath, JSON.stringify(data));
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
    const code = generateMainSpecTsCode(specification);
    const filePath = path.join(options.directoryPath, "main.test.ts");
    writeCodeToFile(filePath, code);
  }
}

function writeCodeToFile(filePath: string, code: NestedText) {
  const fd = fs.openSync(filePath, "w");

  fs.writeFileSync(fd, banner);
  fs.writeFileSync(fd, "\n\n");

  for (const text of flattenNestedText(code)) {
    fs.writeFileSync(fd, text);
  }
  fs.closeSync(fd);
}
