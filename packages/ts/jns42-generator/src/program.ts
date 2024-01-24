import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import * as programs from "./programs/index.js";
import { packageInfo } from "./utils/index.js";

await main(process.argv, process.env);

async function main(argv: string[], env: Record<string, string | undefined>) {
  const program = yargs(hideBin(process.argv));

  programs.configurePackageProgram(program);
  programs.configureIntermediateProgram(program);
  if (env.NODE_ENV === "development") {
    // only enabled when debugging
    programs.configureTestProgram(program);
  }

  program.version(packageInfo.version!);
  program.demandCommand();

  await program.parseAsync();
}
