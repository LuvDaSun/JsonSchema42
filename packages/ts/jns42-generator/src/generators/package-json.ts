import { PackageJson } from "type-fest";
import { packageInfo } from "../utils/index.js";

export function getPackageJsonData(name: string, version: string) {
  const content: PackageJson = {
    name: name,
    version: version,
    sideEffects: false,
    type: "module",
    main: "main.js",
    types: "main.d.ts",
    files: ["*"],
    exports: {
      ".": {
        default: "./main.js",
      },
      "./types": {
        default: "./types.js",
      },
      "./validators": {
        default: "./validators.js",
      },
    },
    scripts: {
      build: "tsc",
      test: "node --test ./*.test.js",
    },
    author: "",
    license: "ISC",
    dependencies: withDependencies(["@types/node"]),
    devDependencies: withDependencies(["typescript"]),
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
