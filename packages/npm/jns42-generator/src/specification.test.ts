import * as core from "@jns42/core";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { generatePackage } from "./generators.js";
import * as models from "./models.js";
import { projectRoot, workspaceRoot } from "./root.js";

await test.suite("specifications", { concurrency: true }, async () => {
  const specificationDirectoryPath = path.join(workspaceRoot, "fixtures", "specifications");
  const generatedDirectoryPath = path.join(projectRoot, ".generated");

  const files = await fs.readdir(specificationDirectoryPath);
  for (const fileName of files) {
    const extension = path.extname(fileName).toLowerCase();
    if (!(extension === ".json" || extension === ".yaml")) {
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
      const packageDirectoryPath = path.join(generatedDirectoryPath, packageName);
      await fs.mkdir(packageDirectoryPath, { recursive: true });

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
      });
    });
  }
});
