import camelcase from "camelcase";
import cp from "child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import YAML from "yaml";
import * as schemaDraft04 from "../documents/draft-04/index.js";
import * as schema202012 from "../documents/draft-2020-12/index.js";
import { DocumentContext } from "../documents/index.js";
import * as schemaIntermediateB from "../documents/intermediate-b/index.js";
import { generatePackage } from "../generators/index.js";
import { Namer, projectRoot } from "../utils/index.js";

const packageNames = [
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
    "fixtures",
    "testing",
    `${packageName}.yaml`,
  );

  if (!fs.existsSync(testPath)) {
    return;
  }

  const testUrl = new URL(`file://${testPath}`);
  const rootTypeName = camelcase(`${packageName}.yaml`, { pascalCase: true });

  const testContent = fs.readFileSync(testPath, "utf8");
  const testData = YAML.parse(testContent);

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
          new schemaDraft04.Document(
            givenUrl,
            antecedentUrl,
            rootNode,
            context,
          ),
      );
      context.registerFactory(
        schemaIntermediateB.metaSchemaId,
        ({ givenUrl, documentNode: rootNode }) =>
          new schemaIntermediateB.Document(givenUrl, rootNode),
      );

      await context.loadFromDocument(
        testUrl,
        testUrl,
        null,
        schema,
        schema202012.metaSchemaId,
      );

      const intermediateData = context.getIntermediateData();

      const namer = new Namer("schema");
      for (const nodeId in intermediateData.schemas) {
        const nodeUrl = new URL(nodeId);
        const path = nodeUrl.pathname + nodeUrl.hash.replace(/^#/g, "");
        namer.registerPath(nodeId, path);
      }

      const names = namer.getNames();

      const factory = ts.factory;
      generatePackage(factory, intermediateData, names, {
        directoryPath: packageDirectoryPath,
        name: packageName,
        version: "v0.0.0",
      });
    });

    await test("install package", () => {
      cp.execSync("npm install", {
        cwd: packageDirectoryPath,
        env: process.env,
      });
    });

    await test("test package", () => {
      cp.execSync("test package", {
        cwd: packageDirectoryPath,
        env: process.env,
      });
    });

    await test("valid", async () => {
      for (const testName in testData.valid as Record<string, unknown>) {
        let data = testData.valid[testName];
        await test(testName, async () => {
          const packageMain = await import(
            path.join(packageDirectoryPath, "main.js")
          );
          assert.equal(packageMain[`is${rootTypeName}`](data), true);
        });
      }
    });

    await test("invalid", async () => {
      for (const testName in testData.invalid as Record<string, unknown>) {
        let data = testData.invalid[testName];
        await test(testName, async () => {
          const packageMain = await import(
            path.join(packageDirectoryPath, "main.js")
          );
          assert.equal(packageMain[`is${rootTypeName}`](data), false);
        });
      }
    });
  }
}
