#!/usr/bin/env node

import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import * as programs from "./programs.js";
import { packageInfo } from "./utilities.js";

await main();

async function main() {
  const program = yargs(hideBin(process.argv));

  programs.configurePackageProgram(program);

  program.version(packageInfo.version!);
  program.demandCommand();

  await program.parseAsync();
}
