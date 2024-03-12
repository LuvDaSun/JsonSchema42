import path from "path";

export const projectRoot = makeProjectRoot();

function makeProjectRoot() {
  const dirname = import.meta.dirname;
  return path.resolve(dirname, "..");
}
