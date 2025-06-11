import path from "node:path";
import { fileURLToPath } from "node:url";

export function makeProjectRoot() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(dirname, "..");
}

export function makeWorkspaceRoot() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(dirname, "..", "..", "..", "..");
}
