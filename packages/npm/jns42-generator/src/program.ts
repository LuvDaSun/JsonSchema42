import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import * as programs from "./programs.js";
import { readPackageInfo } from "./utilities.js";

await main();

async function main() {
  const packageInfo = readPackageInfo();

  const program = yargs(hideBin(process.argv));

  programs.configurePackageProgram(program);

  program.version(packageInfo.version!);
  program.demandCommand();

  await program.parseAsync();
}
