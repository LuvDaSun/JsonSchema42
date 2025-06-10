import * as core from "@jns42/core";
import cp from "child_process";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { generatePackage } from "./generators.js";
import * as models from "./models.js";
import { projectRoot, workspaceRoot } from "./root.js";

await test.suite("specifications", { concurrency: false }, async () => {
  const specificationDirectoryPath = path.join(workspaceRoot, "fixtures", "specifications");
  const packageDirectoryRoot = path.join(projectRoot, ".generated", "specifications");

  const files = await fs.readdir(specificationDirectoryPath);
  for (const fileName of files) {
    const extension = path.extname(fileName).toLowerCase();
    if (!(extension === ".json" || extension === ".yaml" || extension === ".yml")) {
      continue;
    }

    const filePath = path.join(specificationDirectoryPath, fileName);
    const fileStat = await fs.stat(filePath);
    if (!fileStat.isFile()) {
      continue;
    }
    const packageName = fileName.substring(0, fileName.length - extension.length);
    const packageVersion = "0.1.0";

    await test(packageName, async () => {
      const packageDirectoryPath = path.join(packageDirectoryRoot, packageName);
      await fs.rm(packageDirectoryPath, { force: true, recursive: true });

      await test("generate package", async () => {
        const context = new core.DocumentContextContainer();
        context.registerWellKnownFactories();

        await context.loadFromLocation(
          filePath,
          filePath,
          undefined,
          "https://json-schema.org/draft/2020-12/schema",
        );

        const specification = models.loadSpecification(context, {
          transformMaximumIterations: 100,
          defaultTypeName: "schema-document",
        });

        generatePackage(specification, {
          packageDirectoryPath,
          packageName,
          packageVersion,
          entryLocation: filePath + "#",
        });
      });

      const options = {
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

      await test("test package", () => {
        cp.execFileSync("npm", ["test"], options);
      });
    });
  }
});
