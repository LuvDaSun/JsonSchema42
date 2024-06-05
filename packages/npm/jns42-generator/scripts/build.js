#!/usr/bin/env node

import cp from "child_process";
import path from "path";

const options = { shell: true, stdio: "inherit", env: process.env };

cp.execFileSync("npm", ["--workspace", "@jns42/core", "run", "build"], options);

cp.execFileSync("tsc", [], options);

cp.execFileSync("rollup", ["--config", path.resolve("rollup.config.js")], options);
