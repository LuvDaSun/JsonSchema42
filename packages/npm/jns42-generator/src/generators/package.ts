import fs from "node:fs";
import path from "node:path";
import * as models from "../models.js";
import { NestedText, flattenNestedText, itt, splitIterableText } from "../utilities.js";
import { generateBuildJsCode } from "./build-js.js";
import { generateExamplesTestTsCode } from "./examples-test-ts.js";
import { generateMainTsCode } from "./main-ts.js";
import { generateMocksTestTsCode } from "./mocks-test-ts.js";
import { generateMocksTsCode } from "./mocks-ts.js";
import { generatePackageJsonData } from "./package-json.js";
import { generateParsersTsCode } from "./parsers-ts.js";
import { generateRollupConfigJsCode } from "./rollup-config-js.js";
import { generateTsconfigJsonData } from "./tsconfig-json.js";
import { generateTypesTsCode } from "./types-ts.js";
import { generateValidatorsTsCode } from "./validators-ts.js";

export interface PackageConfiguration {
  packageName: string;
  packageVersion: string;
  packageDirectoryPath: string;
}

export function generatePackage(
  specification: models.Specification,
  configuration: PackageConfiguration,
) {
  const { packageDirectoryPath, packageName, packageVersion } = configuration;

  fs.mkdirSync(packageDirectoryPath, { recursive: true });
  fs.mkdirSync(path.join(packageDirectoryPath, "src"), { recursive: true });
  fs.mkdirSync(path.join(packageDirectoryPath, "scripts"), { recursive: true });

  {
    const content = generatePackageJsonData(packageName, packageVersion);
    const filePath = path.join(packageDirectoryPath, "package.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = generateTsconfigJsonData();
    const filePath = path.join(packageDirectoryPath, "tsconfig.json");
    fs.writeFileSync(filePath, JSON.stringify(content, undefined, 2));
  }

  {
    const content = generateRollupConfigJsCode();
    const filePath = path.join(packageDirectoryPath, "rollup.config.js");
    writeContentToFile(filePath, content);
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
    const content = generateBuildJsCode();
    const filePath = path.join(packageDirectoryPath, "scripts", "build.js");
    writeContentToFile(filePath, content);
    fs.chmodSync(filePath, 0o755);
  }

  {
    const content = itt`
      .*
      !.gitignore
      *.tsbuildinfo
      transpiled/
      typed/
      bundled/
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
