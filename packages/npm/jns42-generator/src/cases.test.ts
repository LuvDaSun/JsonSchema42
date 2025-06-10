import * as core from "@jns42/core";
import cp from "child_process";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import YAML from "yaml";
import { generatePackage } from "./generators.js";
import * as models from "./models.js";
import { projectRoot, workspaceRoot } from "./root.js";

await test.suite("cases", { concurrency: false }, async () => {
  const fixturesDirectoryPath = path.join(workspaceRoot, "fixtures", "cases");
  const packageDirectoryRoot = path.join(projectRoot, ".generated", "cases");

  const files = await fs.readdir(fixturesDirectoryPath);
  for (const fileName of files) {
    const extension = path.extname(fileName).toLowerCase();
    if (!(extension === ".json" || extension === ".yaml" || extension === ".yml")) {
      continue;
    }

    const filePath = path.join(fixturesDirectoryPath, fileName);
    const fileStat = await fs.stat(filePath);
    if (!fileStat.isFile()) {
      continue;
    }
    const packageName = fileName.substring(0, fileName.length - extension.length);
    const packageVersion = "0.1.0";

    await test(packageName, async () => {
      const defaultTypeName = new core.Sentence("schema-document");

      const testContent = await fs.readFile(filePath, "utf8");
      const testData = YAML.parse(testContent);

      const parseData = testData.parse ?? false;
      const schemas = testData.schemas as string[];
      for (const schemaFileName of schemas) {
        const schemaFilePath = path.resolve(path.dirname(filePath), schemaFileName);
        const schemaBaseName = path.basename(schemaFilePath);

        await test(schemaBaseName, async () => {
          const packageDirectoryPath = path.join(packageDirectoryRoot, packageName, schemaBaseName);
          await fs.rm(packageDirectoryPath, { force: true, recursive: true });

          await test("generate package", async () => {
            const context = new core.DocumentContextContainer();
            context.registerWellKnownFactories();

            await context.loadFromLocation(
              schemaFilePath,
              schemaFilePath,
              undefined,
              "https://json-schema.org/draft/2020-12/schema",
            );

            const specification = models.loadSpecification(context, {
              transformMaximumIterations: 100,
              defaultTypeName: defaultTypeName.toPascalCase(),
            });

            generatePackage(specification, {
              packageDirectoryPath,
              packageName,
              packageVersion,
              entryLocation: schemaFilePath + "#",
            });
          });

          const options = {
            cwd: packageDirectoryPath,
            env: process.env,
          } as const;

          await test("install package", () => {
            cp.execFileSync("npm", ["install"], options);
          });

          await test("build package", () => {
            cp.execFileSync("npm", ["run", "build"], options);
          });

          await test("assert valid", async () => {
            for (const testCase of testData.valid as unknown[]) {
              cp.execFileSync(
                "npm",
                ["run", "program", "--", "assert", ...(parseData ? ["--parse"] : [])],
                {
                  ...options,
                  input: JSON.stringify(testCase),
                },
              );
            }
          });

          await test("assert invalid", async () => {
            for (const testCase of testData.invalid as unknown[]) {
              assert.throws(() => {
                cp.execFileSync(
                  "npm",
                  ["run", "program", "--", "assert", ...(parseData ? ["--parse"] : [])],
                  {
                    ...options,
                    input: JSON.stringify(testCase),
                  },
                );
              });
            }
          });
        });
      }
    });
  }
});
