import * as schemaIntermediate from "@luvdasun/schema-intermediate";
import fs from "node:fs";
import path from "node:path";
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

export interface PackageConfiguration {
  packageName: string;
  packageVersion: string;
  packageDirectoryPath: string;
}

export function generatePackage(
  document: schemaIntermediate.SchemaDocument,
  specification: models.Specification,
  configuration: PackageConfiguration,
) {
  const { packageDirectoryPath, packageName, packageVersion } = configuration;

  fs.mkdirSync(packageDirectoryPath, { recursive: true });
  fs.mkdirSync(path.join(packageDirectoryPath, "src"), { recursive: true });

  {
    const content = getPackageJsonData(packageName, packageVersion);
    const filePath = path.join(packageDirectoryPath, "package.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = specification.names;
    const filePath = path.join(packageDirectoryPath, "names.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = document;
    const filePath = path.join(packageDirectoryPath, "intermediate.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = getTsconfigJsonData();
    const filePath = path.join(packageDirectoryPath, "tsconfig.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = generateMainTsCode(specification, configuration);
    const filePath = path.join(packageDirectoryPath, "src", "main.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateValidatorsTsCode(specification, configuration);
    const filePath = path.join(packageDirectoryPath, "src", "validators.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateTypesTsCode(specification, configuration);
    const filePath = path.join(packageDirectoryPath, "src", "types.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateParsersTsCode(specification, configuration);
    const filePath = path.join(packageDirectoryPath, "src", "parsers.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateMocksTsCode(specification, configuration);
    const filePath = path.join(packageDirectoryPath, "src", "mocks.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateExamplesTestTsCode(specification, configuration);
    const filePath = path.join(packageDirectoryPath, "src", "examples.test.ts");
    writeContentToFile(filePath, content);
  }

  {
    const content = generateMocksTestTsCode(specification, configuration);
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
