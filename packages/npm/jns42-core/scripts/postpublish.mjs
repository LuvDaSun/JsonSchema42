#!/usr/bin/env node

import cp from "child_process";

const options = {
  shell: true,
  stdio: "inherit",
  env: process.env,
  cwd: process.env.npm_config_local_prefix,
};

// retry until it worked.
while (true) {
  // wait 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    cp.execFileSync(
      "npm",
      [
        "--workspace",
        "@jns42/generator",
        "install",
        `${process.env.npm_package_name}@${process.env.npm_package_version}`,
      ],
      options,
    );
    break;
  } catch (error) {
    continue;
  }
}
