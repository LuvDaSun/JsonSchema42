#!/usr/bin/env node

import assert from "assert";
import cp from "child_process";

const options = {
  shell: true,
  stdio: "inherit",
  env: process.env,
  cwd: process.env.npm_config_local_prefix,
};
const pipeOptions = { ...options, stdio: "pipe" };

// are there uncommitted changes
const status = cp.execFileSync("git", ["status", "--porcelain"], pipeOptions).toString();
assert.equal(status, "");

// check if we are on the main branch
const branch = cp.execFileSync("git", ["branch", "--show-current"], pipeOptions).toString();
assert.equal(branch, "main");

cp.execFileSync("npm", ["run", "formatting"], options);
cp.execFileSync("npm", ["run", "spelling"], options);
cp.execFileSync("npm", ["--workspace", process.env.npm_package_name, "run", "test"], options);
