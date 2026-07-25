import replace from "@rollup/plugin-replace";
import { fileURLToPath } from "node:url";
import path from "path";
import { defineConfig } from "rollup";

const external = (id, parent, resolved) => !(id.startsWith(".") || path.isAbsolute(id));

const onwarn = (warning, warn) => {
  // switch (warning.code) {
  //   case "CIRCULAR_DEPENDENCY":
  //   case "EVAL":
  //     return;
  // }

  warn(warning);
};

const workspaceRoot = path.dirname(fileURLToPath(import.meta.url));
const npmPackagesRoot = path.join(workspaceRoot, "packages", "npm");

export default defineConfig([
  {
    external,
    input: path.join(npmPackagesRoot, "jns42-lib", "transpiled", "main.js"),
    output: {
      file: path.join(npmPackagesRoot, "jns42-lib", "bundled", "main.js"),
      format: "module",
      sourcemap: true,
    },
    context: "global",
    plugins: [
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
        preventAssignment: true,
      }),
    ],
  },
  {
    external,
    input: path.join(npmPackagesRoot, "jns42-lib", "transpiled", "main.js"),
    output: {
      file: path.join(npmPackagesRoot, "jns42-lib", "bundled", "main.cjs"),
      format: "commonjs",
      sourcemap: true,
    },
    context: "global",
    plugins: [
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
        preventAssignment: true,
      }),
    ],
  },

  {
    external,
    input: path.join(npmPackagesRoot, "jns42-generator", "transpiled", "main.js"),
    output: {
      file: path.join(npmPackagesRoot, "jns42-generator", "bundled", "main.js"),
      format: "module",
      sourcemap: true,
    },
    context: "global",
    plugins: [
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
        preventAssignment: true,
      }),
    ],
  },
  {
    external,
    input: path.join(npmPackagesRoot, "jns42-generator", "transpiled", "main.js"),
    output: {
      file: path.join(npmPackagesRoot, "jns42-generator", "bundled", "main.cjs"),
      format: "commonjs",
      sourcemap: true,
    },
    context: "global",
    plugins: [
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
        preventAssignment: true,
      }),
    ],
  },
  {
    external,
    input: path.join(npmPackagesRoot, "jns42-generator", "transpiled", "program.js"),
    output: {
      file: path.join(npmPackagesRoot, "jns42-generator", "bundled", "program.js"),
      format: "module",
      sourcemap: true,
    },
    context: "global",
    plugins: [
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
        preventAssignment: true,
      }),
    ],
  },
]);
