import * as path from "path";

export const projectRoot = makeProjectRoot();

function makeProjectRoot() {
  const dirname = import.meta.dirname ?? global["__dirname"];
  return path.resolve(dirname, "..");
}
