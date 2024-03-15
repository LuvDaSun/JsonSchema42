import { toPascal } from "@jns42/core";
import assert from "assert";
import cp from "child_process";
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
import { NodeLocation } from "../utils/index.js";

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
        .option("default-meta-schema-location", {
          description: "the default meta schema to use",
          type: "string",
          choices: [
            schema202012.metaSchemaId,
            schemaDraft04.metaSchemaId,
            schemaIntermediate.metaSchemaId,
          ] as const,
          default: schema202012.metaSchemaId,
        })
        .option("package-directory", {
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
        .option("default-type-name", {
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
  defaultMetaSchemaLocation: string;
  packageDirectory: string;
  packageName: string;
  packageVersion: string;
  defaultTypeName: string;
  nameMaximumIterations: number;
  transformMaximumIterations: number;
}

async function main(configuration: MainConfiguration) {
  const pathToTest = path.resolve(configuration.pathToTest);

  const defaultMetaSchemaId = configuration.defaultMetaSchemaLocation;
  const packageDirectoryRoot = path.resolve(configuration.packageDirectory);
  const {
    packageName,
    packageVersion,
    nameMaximumIterations,
    transformMaximumIterations,
    defaultTypeName: defaultName,
  } = configuration;

  const testLocation = NodeLocation.parse(pathToTest);
  const defaultTypeName = toPascal(defaultName);

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
        ({
          retrievalLocation: retrievalLocation,
          givenLocation: givenLocation,
          antecedentLocation: antecedentLocation,
          documentNode: documentNode,
        }) =>
          new schemaDraft202012.Document(
            retrievalLocation,
            givenLocation,
            antecedentLocation,
            documentNode,
            context,
          ),
      );
      context.registerFactory(
        schemaDraft04.metaSchemaId,
        ({
          retrievalLocation: retrievalLocation,
          givenLocation: givenLocation,
          antecedentLocation: antecedentLocation,
          documentNode: documentNode,
        }) =>
          new schemaDraft04.Document(
            retrievalLocation,
            givenLocation,
            antecedentLocation,
            documentNode,
            context,
          ),
      );
      context.registerFactory(
        schemaOasV31.metaSchemaId,
        ({
          retrievalLocation: retrievalLocation,
          givenLocation: givenLocation,
          antecedentLocation: antecedentLocation,
          documentNode: documentNode,
        }) =>
          new schemaOasV31.Document(
            retrievalLocation,
            givenLocation,
            antecedentLocation,
            documentNode,
            context,
          ),
      );
      context.registerFactory(
        oasV30.metaSchemaId,
        ({
          retrievalLocation: retrievalLocation,
          givenLocation: givenLocation,
          antecedentLocation: antecedentLocation,
          documentNode: documentNode,
        }) =>
          new oasV30.Document(
            retrievalLocation,
            givenLocation,
            antecedentLocation,
            documentNode,
            context,
          ),
      );
      context.registerFactory(
        swaggerV2.metaSchemaId,
        ({
          retrievalLocation: retrievalLocation,
          givenLocation: givenLocation,
          antecedentLocation: antecedentLocation,
          documentNode: documentNode,
        }) =>
          new swaggerV2.Document(
            retrievalLocation,
            givenLocation,
            antecedentLocation,
            documentNode,
            context,
          ),
      );
      context.registerFactory(
        schemaIntermediate.metaSchemaId,
        ({ givenLocation: givenLocation, documentNode: documentNode }) =>
          new schemaIntermediate.Document(givenLocation, documentNode),
      );

      await context.loadFromDocument(testLocation, testLocation, null, schema, defaultMetaSchemaId);

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

    const options = {
      stdio: "inherit",
      shell: true,
      cwd: packageDirectoryPath,
      env: process.env,
    } as const;

    cp.execFileSync("npm", ["install"], options);

    test("test package", () => {
      cp.execFileSync("npm", ["test"], options);
    });

    await test("valid", async () => {
      const packageMain = await import(
        "file://" + path.join(packageDirectoryPath, "transpiled", "main.js")
      );
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
      const packageMain = await import(
        "file://" + path.join(packageDirectoryPath, "transpiled", "main.js")
      );
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
