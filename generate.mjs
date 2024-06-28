#!/usr/bin/env node

import cp from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(dirname);

const options = {
  shell: true,
  stdio: "inherit",
  env: process.env,
  cwd: workspaceRoot,
};

const packages = [
  ["schema-draft-04", "http://json-schema.org/draft-04/schema#"],
  // ["schema-draft-06", "http://json-schema.org/draft-06/schema#"],
  // ["schema-draft-07", "http://json-schema.org/draft-07/schema#"],
  // ["schema-draft-2019-09", "https://json-schema.org/draft/2019-09/schema"],
  ["schema-draft-2020-12", "https://json-schema.org/draft/2020-12/schema"],
  // ["schema-swagger-v2", "http://swagger.io/v2/schema.json#/definitions/schema"],
  ["schema-oas-v3-0", "https://spec.openapis.org/oas/3.0/schema/2021-09-28#/definitions/Schema"],
  ["schema-oas-v3-1", "https://spec.openapis.org/oas/3.1/dialect/base"],
  ["swagger-v2", "http://swagger.io/v2/schema.json#"],
  ["oas-v3-0", "https://spec.openapis.org/oas/3.0/schema/2021-09-28"],
  ["oas-v3-1", "https://spec.openapis.org/oas/3.1/schema/2022-10-07"],
];

cp.execFileSync("cargo", ["build"], options);
cp.execFileSync("npm", ["run", "--workspaces", "build"], options);

for (const [name, location] of packages) {
  cp.execFileSync("cargo", [
    "run",
    "--package",
    "jns42-generator",
    "package",
    location,
    "--package-directory",
    path.join(workspaceRoot, "generated", "cargo", name),
    "--package-name",
    name,
    "--package-version",
    "0.1.0",
  ]);

  cp.execFileSync("node", [
    path.join(workspaceRoot, "packages", "npm", "jns42-generator", "bundled", "program.js"),
    "package",
    location,
    "--package-directory",
    path.join(workspaceRoot, "generated", "npm", name),
    "--package-name",
    name,
    "--package-version",
    "0.1.0",
  ]);
}
