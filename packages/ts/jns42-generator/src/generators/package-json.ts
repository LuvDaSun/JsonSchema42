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
    scripts: {
      prepare: "tsc",
      test: "node --test ./*.spec.js",
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
        [name]:
          packageInfo.dependencies?.[name] ??
          packageInfo.devDependencies?.[name],
      }),
    {},
  );
}
