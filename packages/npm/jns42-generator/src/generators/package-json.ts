import { PackageJson } from "type-fest";
import { packageInfo } from "../utilities.js";

export function generatePackageJsonData(name: string, version: string) {
  const content: PackageJson = {
    name,
    version,
    sideEffects: false,
    type: "module",
    module: "./bundled/main.js",
    main: "./bundled/main.cjs",
    types: "./typed/main.d.ts",
    exports: {
      ".": {
        import: "./bundled/main.js",
        require: "./bundled/main.cjs",
        types: "./typed/main.d.ts",
      },
    },
    files: ["./typed/**", "./bundled/**"],
    scripts: {
      prepack: "node ./scripts/build.js",
      pretest: "tsc",
      build: "node ./scripts/build.js",
      clean: "node ./scripts/clean.js",
      test: "node --test ./transpiled/examples.test.js ./transpiled/mocks.test.js",
    },
    author: "",
    license: "ISC",
    dependencies: withDependencies(["@types/node", "@jns42/lib"]),
    devDependencies: withDependencies([
      "typescript",
      "@tsconfig/node20",
      "rollup",
      "@rollup/plugin-replace",
    ]),
    engines: {
      node: ">=18",
    },
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
