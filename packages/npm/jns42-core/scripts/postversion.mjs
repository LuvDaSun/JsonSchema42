#!/usr/bin/env node

import cp from "child_process";

const options = {
  shell: true,
  stdio: "inherit",
  env: process.env,
  cwd: process.env.npm_config_local_prefix,
};

const tag = `npm:${process.env.npm_package_name}@${process.env.npm_new_version}`;

cp.execFileSync("git", ["add", process.env.npm_package_json], options);
cp.execFileSync("git", ["commit", "--message", tag], options);
cp.execFileSync("git", ["tag", tag], options);
