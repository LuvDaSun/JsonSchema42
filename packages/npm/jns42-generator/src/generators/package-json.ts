import { PackageJson } from "type-fest";
import { packageInfo } from "../utils/index.js";

export function generatePackageJsonData(name: string, version: string) {
  const content: PackageJson = {
    name,
    version,
    sideEffects: false,
    type: "module",
    main: "./bundled/main.cjs",
    module: "./bundled/main.js",
    types: "./types/main.d.ts",
    exports: {
      ".": {
        require: "./bundled/main.cjs",
        import: "./bundled/main.js",
        types: "./types/main.d.ts",
      },
    },
    files: ["./types/**", "./bundled/**"],
    scripts: {
      prepack: "./scripts/build.js",
      pretest: "./scripts/build.js",
      build: "./scripts/build.js",
      clean: "./scripts/clean.js",
      test: "node --test ./transpiled/**/*.test.js",
    },
    author: "",
    license: "ISC",
    dependencies: withDependencies(["@types/node"]),
    devDependencies: withDependencies(["typescript", "rollup", "@tsconfig/node20"]),
  };

  return content;
}

function withDependencies(names: string[]) {
  return names.reduce(
    (o, name) =>
      Object.assign(o, {
        [name]: packageInfo.dependencies?.[name] ?? packageInfo.devDependencies?.[name],
      }),
    {},
  );
}
