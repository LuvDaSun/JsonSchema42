import camelcase from "camelcase";
import cp from "child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as path from "node:path";
import test from "node:test";
import YAML from "yaml";
import * as yargs from "yargs";
import { DocumentContext } from "../documents/document-context.js";
import * as oasV30 from "../documents/oas-v3-0/index.js";
import * as schemaDraft04 from "../documents/schema-draft-04/index.js";
import * as schema202012 from "../documents/schema-draft-2020-12/index.js";
import * as schemaDraft202012 from "../documents/schema-draft-2020-12/index.js";
import * as schemaIntermediate from "../documents/schema-intermediate/index.js";
import * as schemaOasV31 from "../documents/schema-oas-v3-1/index.js";
import * as swaggerV2 from "../documents/swagger-v2/index.js";
import { generatePackage } from "../generators/index.js";
import * as models from "../models/index.js";

export function configureTestProgram(argv: yargs.Argv) {
  return argv.command(
    "test [path-to-test]",
    "test fixture",
    (yargs) =>
      yargs
        .positional("path-to-test", {
          description: "path to the test fixture",
          type: "string",
          demandOption: true,
        })
        .option("default-meta-schema-url", {
          description: "the default meta schema to use",
          type: "string",
          choices: [
            schema202012.metaSchemaId,
            schemaDraft04.metaSchemaId,
            schemaIntermediate.metaSchemaId,
          ] as const,
          default: schema202012.metaSchemaId,
        })
        .option("output-directory", {
          description: "where to output the packages",
          type: "string",
          demandOption: true,
        })
        .option("package-name", {
          description: "name of the package",
          type: "string",
          demandOption: true,
        })
        .option("package-version", {
          description: "version of the package",
          type: "string",
          demandOption: true,
        })
        .option("default-name", {
          description: "default name for types",
          type: "string",
          default: "schema-document",
        })
        .option("name-maximum-iterations", {
          description: "maximum number of iterations for finding unique names",
          type: "number",
          default: 5,
        })
        .option("transform-maximum-iterations", {
          description: "maximum number of iterations for transforming",
          type: "number",
          default: 100,
        }),
    (argv) => main(argv),
  );
}

interface MainConfiguration {
  pathToTest: string;
  defaultMetaSchemaUrl: string;
  outputDirectory: string;
  packageName: string;
  packageVersion: string;
  defaultName: string;
  nameMaximumIterations: number;
  transformMaximumIterations: number;
}

async function main(configuration: MainConfiguration) {
  const pathToTest = path.resolve(configuration.pathToTest);

  const defaultMetaSchemaId = configuration.defaultMetaSchemaUrl;
  const packageDirectoryRoot = path.resolve(configuration.outputDirectory);
  const {
    packageName,
    packageVersion,
    nameMaximumIterations,
    transformMaximumIterations,
    defaultName,
  } = configuration;

  const testUrl = new URL(`file://${pathToTest}`);
  const defaultTypeName = camelcase(defaultName, { pascalCase: true });

  const testContent = fs.readFileSync(pathToTest, "utf8");
  const testData = YAML.parse(testContent);

  const parseData = testData.parse ?? false;
  const rootTypeName = testData.rootTypeName ?? defaultTypeName;
  const schemas = testData.schemas as Record<string, unknown>;
  for (const schemaName in schemas) {
    const schema = schemas[schemaName];
    const packageDirectoryPath = path.join(packageDirectoryRoot, packageName, schemaName);
    fs.rmSync(packageDirectoryPath, { force: true, recursive: true });

    // generate package
    {
      const context = new DocumentContext();
      context.registerFactory(
        schemaDraft202012.metaSchemaId,
        ({ givenUrl, antecedentUrl, documentNode: rootNode }) =>
          new schemaDraft202012.Document(givenUrl, antecedentUrl, rootNode, context),
      );
      context.registerFactory(
        schemaDraft04.metaSchemaId,
        ({ givenUrl, antecedentUrl, documentNode: rootNode }) =>
          new schemaDraft04.Document(givenUrl, antecedentUrl, rootNode, context),
      );
      context.registerFactory(
        schemaOasV31.metaSchemaId,
        ({ givenUrl, documentNode: rootNode }) =>
          new schemaIntermediate.Document(givenUrl, rootNode),
      );
      context.registerFactory(
        oasV30.metaSchemaId,
        ({ givenUrl, documentNode: rootNode }) =>
          new schemaIntermediate.Document(givenUrl, rootNode),
      );
      context.registerFactory(
        swaggerV2.metaSchemaId,
        ({ givenUrl, documentNode: rootNode }) =>
          new schemaIntermediate.Document(givenUrl, rootNode),
      );
      context.registerFactory(
        schemaIntermediate.metaSchemaId,
        ({ givenUrl, documentNode: rootNode }) =>
          new schemaIntermediate.Document(givenUrl, rootNode),
      );

      await context.loadFromDocument(testUrl, testUrl, null, schema, defaultMetaSchemaId);

      const intermediateDocument = context.getIntermediateData();

      const specification = models.loadSpecification(intermediateDocument, {
        transformMaximumIterations,
        nameMaximumIterations,
        defaultTypeName,
      });

      generatePackage(intermediateDocument, specification, {
        packageDirectoryPath,
        packageName,
        packageVersion,
      });
    }

    // install package
    {
      cp.execSync("npm install", {
        cwd: packageDirectoryPath,
        env: process.env,
        stdio: "inherit",
      });
    }

    // build package
    {
      cp.execSync("npm run build", {
        cwd: packageDirectoryPath,
        env: process.env,
        stdio: "inherit",
      });
    }

    test("test package", () => {
      cp.execSync("npm test", {
        cwd: packageDirectoryPath,
        env: process.env,
        stdio: "inherit",
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
          const valid = packageMain[`is${rootTypeName}`](data);
          assert.equal(valid, true);
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
          const valid = packageMain[`is${rootTypeName}`](data);
          assert.equal(valid, false);
        });
      }
    });
  }
}