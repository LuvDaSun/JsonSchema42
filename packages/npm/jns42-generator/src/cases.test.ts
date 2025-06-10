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
    if (!(extension === ".json" || extension === ".yaml")) {
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
      const rootTypeName = testData.rootTypeName ?? defaultTypeName;
      const schemas = testData.schemas as string[];
      for (const schemaFileName of schemas) {
        const schemaFilePath = path.resolve(path.dirname(filePath), schemaFileName);

        const packageDirectoryPath = path.join(
          packageDirectoryRoot,
          packageName,
          path.basename(schemaFilePath),
        );
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
          stdio: "ignore",
          shell: true,
          cwd: packageDirectoryPath,
          env: process.env,
        } as const;

        await test("install package", () => {
          cp.execFileSync("npm", ["install"], options);
        });

        await test("build package", () => {
          cp.execFileSync("npm", ["run", "build"], options);
        });

        await test("test package", async () => {
          const transpiledDirectoryPath = path.join(packageDirectoryPath, "transpiled");
          const files = await fs.readdir(transpiledDirectoryPath);
          for (const fileName of files) {
            if (!fileName.endsWith(".test.js")) {
              continue;
            }

            const filePath = path.join(transpiledDirectoryPath, fileName);
            const fileStat = await fs.stat(filePath);
            if (!fileStat.isFile()) {
              continue;
            }

            await import(filePath);
          }
        });

        await test("valid", async () => {
          const packageMain = await import(
            "file://" + path.join(packageDirectoryPath, "transpiled", "main.js")
          );
          for (const testName in testData.valid as Record<string, unknown>) {
            let data = testData.valid[testName];
            await test(testName, async () => {
              if (parseData) {
                data = packageMain.parsers[`parse${rootTypeName}`](data);
              }
              const valid = packageMain.validators[`is${rootTypeName}`](data);
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
                data = packageMain.parsers[`parse${rootTypeName}`](data);
              }
              const valid = packageMain.validators[`is${rootTypeName}`](data);
              assert.equal(valid, false);
            });
          }
        });
      }
    });
  }
});
