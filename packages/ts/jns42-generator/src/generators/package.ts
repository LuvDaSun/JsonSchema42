import fs from "node:fs";
import path from "node:path";
import * as schemaIntermediate from "schema-intermediate";
import * as models from "../models/index.js";
import { NestedText, flattenNestedText, itt, splitIterableText } from "../utils/index.js";
import { generateExamplesTestTsCode } from "./examples-test-ts.js";
import { generateMainTsCode } from "./main-ts.js";
import { generateMocksTestTsCode } from "./mocks-test-ts.js";
import { generateMocksTsCode } from "./mocks-ts.js";
import { getPackageJsonData } from "./package-json.js";
import { generateParsersTsCode } from "./parsers-ts.js";
import { getTsconfigJsonData } from "./tsconfig-json.js";
import { generateTypesTsCode } from "./types-ts.js";
import { generateValidatorsTsCode } from "./validators-ts.js";

export interface PackageOptions {
  packageName: string;
  packageVersion: string;
  packageDirectoryPath: string;
  anyOfHack: boolean;
}

export function generatePackage(
  intermediateData: schemaIntermediate.SchemaDocument,
  namesData: Record<string, string>,
  types: Record<string, models.Union | models.Alias>,
  options: PackageOptions,
) {
  const { anyOfHack, packageDirectoryPath, packageName, packageVersion } = options;

  const specification = {
    names: namesData,
    nodes: intermediateData.schemas,
    types,
    options: {
      anyOfHack,
    },
  };

  fs.mkdirSync(packageDirectoryPath, { recursive: true });
  fs.mkdirSync(path.join(packageDirectoryPath, "src"), { recursive: true });

  {
    const content = getPackageJsonData(packageName, packageVersion);
    const filePath = path.join(packageDirectoryPath, "package.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = namesData;
    const filePath = path.join(packageDirectoryPath, "names.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = intermediateData;
    const filePath = path.join(packageDirectoryPath, "intermediate.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = getTsconfigJsonData();
    const filePath = path.join(packageDirectoryPath, "tsconfig.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = generateMainTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "main.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateValidatorsTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "validators.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateTypesTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "types.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateParsersTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "parsers.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateMocksTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "mocks.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateExamplesTestTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "examples.test.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateMocksTestTsCode(specification);
    const filePath = path.join(packageDirectoryPath, "src", "mocks.test.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = itt`
      *.tsbuildinfo
      out/
    `;
    const filePath = path.join(packageDirectoryPath, ".gitignore");
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
