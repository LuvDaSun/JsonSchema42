import * as schemaIntermediateB from "jns42-schema-intermediate";
import fs from "node:fs";
import path from "node:path";
import { NestedText, flattenNestedText, itt, splitIterableText } from "../utils/index.js";
import { generateMainTsCode } from "./main-ts.js";
import { getPackageJsonData } from "./package-json.js";
import { generateParsersTsCode } from "./parsers-ts.js";
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
  fs.mkdirSync(path.join(options.directoryPath, "src"));

  {
    const content = getPackageJsonData(options.name, options.version);
    const filePath = path.join(options.directoryPath, "package.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  // {
  //   const content = namesData;
  //   const filePath = path.join(options.directoryPath, "names.json");
  //   fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  // }

  // {
  //   const content = intermediateData;
  //   const filePath = path.join(options.directoryPath, "intermediate.json");
  //   fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  // }

  {
    const content = getTsconfigJsonData();
    const filePath = path.join(options.directoryPath, "tsconfig.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = generateMainTsCode(specification);
    const filePath = path.join(options.directoryPath, "src", "main.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateValidatorsTsCode(specification);
    const filePath = path.join(options.directoryPath, "src", "validators.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateTypesTsCode(specification);
    const filePath = path.join(options.directoryPath, "src", "types.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateParsersTsCode(specification);
    const filePath = path.join(options.directoryPath, "src", "parsers.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateValidatorsTestTsCode(specification);
    const filePath = path.join(options.directoryPath, "src", "validators.test.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = itt`
      *.tsbuildinfo
      out/
    `;
    const filePath = path.join(options.directoryPath, ".gitignore");
    writeContentToFile(filePath, content);
  }
}

function writeContentToFile(filePath: string, code: NestedText) {
  const fd = fs.openSync(filePath, "w");

  try {
    for (let text of splitIterableText(flattenNestedText(code))) {
      text = text.trim();
      if (text.length === 0) {
        continue;
      }
      text += "\n";
      fs.writeFileSync(fd, text);
    }
  } finally {
    fs.closeSync(fd);
  }
}
