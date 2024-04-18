import * as core from "@jns42/core";
import assert from "assert";
import cp from "child_process";
import fs from "node:fs";
import * as path from "node:path";
import test from "node:test";
import YAML from "yaml";
import * as yargs from "yargs";
import * as schemaDraft04 from "../documents/schema-draft-04/index.js";
import * as schema202012 from "../documents/schema-draft-2020-12/index.js";
import * as schemaIntermediate from "../documents/schema-intermediate/index.js";
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
        .option("default-meta-schema", {
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
  defaultMetaSchema: string;
  packageDirectory: string;
  packageName: string;
  packageVersion: string;
  defaultTypeName: string;
  transformMaximumIterations: number;
}

async function main(configuration: MainConfiguration) {
  const { defaultMetaSchema } = configuration;
  const packageDirectoryRoot = path.resolve(configuration.packageDirectory);
  const pathToTest = path.resolve(configuration.pathToTest);

  const {
    packageName,
    packageVersion,
    transformMaximumIterations,
    defaultTypeName: defaultName,
  } = configuration;

  using defaultTypeName = core.Sentence.new(defaultName);

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
      const context = core.DocumentContext.new();
      context.registerWellKnownFactories();
      await context.loadFromNode(
        pathToTest,
        pathToTest,
        undefined,
        schema,
        defaultMetaSchema as core.MetaSchemaString,
      );

      using specification = models.loadSpecification(context, {
        transformMaximumIterations,
        defaultTypeName: defaultTypeName.toPascalCase(),
      });

      generatePackage(specification, {
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
