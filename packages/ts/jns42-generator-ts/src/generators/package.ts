import * as schemaIntermediateB from "@jns42/jns42-schema-intermediate-b";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { formatData, formatStatements } from "../utils/index.js";
import { MainSpecsTsCodeGenerator } from "./main-specs-ts.js";
import { MainTsCodeGenerator } from "./main-ts.js";
import { getPackageJsonData } from "./package-json.js";
import { getTsconfigJsonData } from "./tsconfig-json.js";

export interface PackageOptions {
  name: string;
  version: string;
  directoryPath: string;
}

export function generatePackage(
  factory: ts.NodeFactory,
  intermediateData: schemaIntermediateB.SchemaJson,
  namesData: Record<string, string>,
  options: PackageOptions,
) {
  fs.mkdirSync(options.directoryPath, { recursive: true });

  {
    const data = getPackageJsonData(options.name, options.version);
    const filePath = path.join(options.directoryPath, "package.json");
    fs.writeFileSync(filePath, formatData(data));
  }

  {
    const data = namesData;
    const filePath = path.join(options.directoryPath, "names.json");
    fs.writeFileSync(filePath, formatData(data));
  }

  {
    const data = intermediateData;
    const filePath = path.join(options.directoryPath, "intermediate.json");
    fs.writeFileSync(filePath, formatData(data));
  }

  {
    const data = getTsconfigJsonData();
    const filePath = path.join(options.directoryPath, "tsconfig.json");
    fs.writeFileSync(filePath, formatData(data));
  }

  {
    const codeGenerator = new MainTsCodeGenerator(
      factory,
      namesData,
      intermediateData.schemas,
    );
    const statements = codeGenerator.getStatements();
    const filePath = path.join(options.directoryPath, "main.ts");
    fs.writeFileSync(filePath, formatStatements(factory, statements));
  }

  {
    const codeGenerator = new MainSpecsTsCodeGenerator(
      factory,
      namesData,
      intermediateData.schemas,
    );
    const statements = codeGenerator.getStatements();
    const filePath = path.join(options.directoryPath, "main.spec.ts");
    fs.writeFileSync(filePath, formatStatements(factory, statements));
  }
}
