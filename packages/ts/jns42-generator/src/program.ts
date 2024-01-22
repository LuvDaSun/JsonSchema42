import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import * as programs from "./programs/index.js";
import { packageInfo } from "./utils/index.js";

main();

async function main() {
  const program = yargs(hideBin(process.argv));

  programs.configurePackageProgram(program);
  programs.configureIntermediateProgram(program);
  if (process.env.NODE_ENV === "development") {
    // only enabled when debugging
    programs.configureTestProgram(program);
  }

  program.version(packageInfo.version!);

  program.parse();
}
