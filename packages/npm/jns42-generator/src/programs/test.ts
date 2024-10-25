import * as core from "@jns42/core";
import assert from "assert";
import cp from "child_process";
import fs from "node:fs";
import * as path from "node:path";
import test from "node:test";
import YAML from "yaml";
import * as yargs from "yargs";
import { generatePackage } from "../generators/package.js";
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
            "https://json-schema.org/draft/2020-12/schema",
            "https://json-schema.org/draft/2019-09/schema",
            "http://json-schema.org/draft-07/schema#",
            "http://json-schema.org/draft-06/schema#",
            "http://json-schema.org/draft-04/schema#",
            "https://spec.openapis.org/oas/3.1/dialect/base",
            "https://spec.openapis.org/oas/3.0/schema/2021-09-28#/definitions/Schema",
            "http://swagger.io/v2/schema.json#/definitions/schema",
          ] as const,
          default: "https://json-schema.org/draft/2020-12/schema",
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

  const defaultTypeName = new core.Sentence(defaultName);

  const testContent = fs.readFileSync(pathToTest, "utf8");
  const testData = YAML.parse(testContent);

  const parseData = testData.parse ?? false;
  const schemas = testData.schemas as Array<string>;
  for (const schemaFilePath of schemas) {
    const schemaPath = path.resolve(path.dirname(pathToTest), schemaFilePath);
    const schemaName = path.basename(schemaFilePath, path.extname(schemaPath));
    const packageDirectoryPath = path.join(packageDirectoryRoot, packageName, schemaName);
    fs.rmSync(packageDirectoryPath, { force: true, recursive: true });

    // generate package
    {
      const context = new core.DocumentContextContainer();
      context.registerWellKnownFactories();

      const entryLocation = await context.loadFromLocation(
        schemaPath,
        schemaPath,
        undefined,
        defaultMetaSchema,
      );

      const specification = models.loadSpecification(context, {
        transformMaximumIterations,
        defaultTypeName: defaultTypeName.toPascalCase(),
      });

      generatePackage(specification, {
        packageDirectoryPath,
        packageName,
        packageVersion,
        entryLocation,
      });
    }

    const options = {
      shell: true,
      cwd: packageDirectoryPath,
      env: process.env,
    } as const;

    cp.execFileSync("npm", ["install"], options);

    cp.execFileSync("npm", ["run", "build"], options);

    await test("valid", async () => {
      for (let data of (testData.valid ?? []) as Array<unknown>) {
        await test(async () => {
          cp.execFileSync(
            "node",
            [
              path.join(packageDirectoryPath, "bundled", "program.js"),
              "assert",
              parseData ? "--parse" : "",
            ],
            {
              ...options,
              input: JSON.stringify(data),
            },
          );
        });
      }
    });

    await test("invalid", async () => {
      for (let data of (testData.invalid ?? []) as Array<unknown>) {
        await test(async () => {
          assert.throws(() =>
            cp.execFileSync(
              "node",
              [
                path.join(packageDirectoryPath, "bundled", "program.js"),
                "assert",
                parseData ? "--parse" : "",
              ],
              {
                ...options,
                input: JSON.stringify(data),
              },
            ),
          );
        });
      }
    });
  }
}
