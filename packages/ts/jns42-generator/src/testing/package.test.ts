import camelcase from "camelcase";
import cp from "child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import YAML from "yaml";
import * as schemaDraft04 from "../documents/draft-04/index.js";
import * as schema202012 from "../documents/draft-2020-12/index.js";
import { DocumentContext } from "../documents/index.js";
import * as schemaIntermediateB from "../documents/intermediate/index.js";
import { generatePackage } from "../generators/index.js";
import { Namer, projectRoot } from "../utils/index.js";

const packageNames = [
  "not",
  "parse",
  "string-or-boolean",
  "simple-object",
  "all-of-object",
  "any-of-object",
  "one-of-object",
  "all-types",
];

for (const packageName of packageNames) {
  await test(packageName, async () => {
    await runTest(packageName);
  });
}

async function runTest(packageName: string) {
  const testPath = path.join(
    projectRoot,
    "..",
    "..",
    "..",
    "fixtures",
    "testing",
    `${packageName}.yaml`,
  );

  if (!fs.existsSync(testPath)) {
    return;
  }

  const testUrl = new URL(`file://${testPath}`);
  const defaultTypeName = camelcase("schema-document", { pascalCase: true });

  const testContent = fs.readFileSync(testPath, "utf8");
  const testData = YAML.parse(testContent);

  const parseData = testData.parse ?? false;
  const rootTypeName = testData.rootTypeName ?? defaultTypeName;
  const schemas = testData.schemas as Record<string, unknown>;
  for (const schemaName in schemas) {
    const schema = schemas[schemaName];
    const packageDirectoryPath = path.join(
      projectRoot,
      ".package",
      "testing",
      schemaName,
      packageName,
    );
    fs.rmSync(packageDirectoryPath, { force: true, recursive: true });

    await test("generate package", async () => {
      const context = new DocumentContext();
      context.registerFactory(
        schema202012.metaSchemaId,
        ({ givenUrl, antecedentUrl, documentNode: rootNode }) =>
          new schema202012.Document(givenUrl, antecedentUrl, rootNode, context),
      );
      context.registerFactory(
        schemaDraft04.metaSchemaId,
        ({ givenUrl, antecedentUrl, documentNode: rootNode }) =>
          new schemaDraft04.Document(givenUrl, antecedentUrl, rootNode, context),
      );
      context.registerFactory(
        schemaIntermediateB.metaSchemaId,
        ({ givenUrl, documentNode: rootNode }) =>
          new schemaIntermediateB.Document(givenUrl, rootNode),
      );

      await context.loadFromDocument(testUrl, testUrl, null, schema, schema202012.metaSchemaId);

      const intermediateData = context.getIntermediateData();

      const namer = new Namer(defaultTypeName, 5);
      for (const nodeId in intermediateData.schemas) {
        const nodeUrl = new URL(nodeId);
        const path = nodeUrl.pathname + nodeUrl.hash.replace(/^#/g, "");
        namer.registerPath(nodeId, path);
      }

      const names = namer.getNames();

      generatePackage(intermediateData, names, {
        packageDirectoryPath: packageDirectoryPath,
        packageName: packageName,
        packageVersion: "v0.0.0",
        anyOfHack: false,
      });
    });

    await test("install package", () => {
      cp.execSync("npm install", {
        cwd: packageDirectoryPath,
        env: process.env,
      });
    });

    await test("build package", () => {
      cp.execSync("npm run build", {
        cwd: packageDirectoryPath,
        env: process.env,
      });
    });

    await test("test package", () => {
      cp.execSync("npm test", {
        cwd: packageDirectoryPath,
        env: process.env,
      });
    });

    await test("valid", async () => {
      const packageMain = await import(path.join(packageDirectoryPath, "out", "main.js"));
      for (const testName in testData.valid as Record<string, unknown>) {
        let data = testData.valid[testName];
        await test(testName, async () => {
          if (parseData) {
            data = packageMain[`parse${rootTypeName}`](data);
          }
          assert.equal(packageMain[`is${rootTypeName}`](data), true);
        });
      }
    });

    await test("invalid", async () => {
      const packageMain = await import(path.join(packageDirectoryPath, "out", "main.js"));
      for (const testName in testData.invalid as Record<string, unknown>) {
        let data = testData.invalid[testName];
        await test(testName, async () => {
          if (parseData) {
            data = packageMain[`parse${rootTypeName}`](data);
          }
          assert.equal(packageMain[`is${rootTypeName}`](data), false);
        });
      }
    });
  }
}
