import { PackageJson } from "type-fest";
import { packageInfo } from "../utils/index.js";

export function getPackageJsonData(name: string, version: string) {
  const content: PackageJson = {
    name,
    version,
    sideEffects: false,
    type: "module",
    main: "./out/main.js",
    types: "./out/main.d.ts",
    files: ["./src/*", "./out/*"],
    exports: {
      ".": {
        default: "./out/main.js",
      },
      "./types": {
        default: "./out/types.js",
      },
      "./validators": {
        default: "./out/validators.js",
      },
      "./parsers": {
        default: "./out/parsers.js",
      },
    },
    scripts: {
      pretest: "tsc --build",
      prepare: "tsc --build",
      build: "tsc --build",
      clean: "rm -rf ./out && tsc --build --clean",
      test: "node --test ./out/*.test.js",
    },
    author: "",
    license: "ISC",
    dependencies: withDependencies(["@types/node"]),
    devDependencies: withDependencies(["typescript", "@tsconfig/node20"]),
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
