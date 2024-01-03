import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import * as programs from "./programs/index.js";

main();

async function main() {
  const program = yargs(hideBin(process.argv));

  programs.configurePackageProgram(program);
  programs.configureIntermediateProgram(program);
  programs.configureTestProgram(program);

  program.demandCommand().parse();
}
