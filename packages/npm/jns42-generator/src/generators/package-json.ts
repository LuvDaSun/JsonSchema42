import { PackageJson } from "type-fest";
import { packageInfo } from "../utils/index.js";

export function generatePackageJsonData(packageName: string, packageVersion: string) {
  const packageNameMatch = /^(?:(@[a-z][a-z0-9\-_\.]*?)\/)?([a-z][a-z0-9\-_\.]*)$/.exec(
    packageName,
  );

  if (packageNameMatch == null) {
    throw new Error("invalid package name");
  }

  const content: PackageJson = {
    name: packageName,
    version: packageVersion,
    sideEffects: false,
    type: "module",
    main: "./bundled/main.cjs",
    module: "./bundled/main.js",
    types: "./typed/main.d.ts",
    exports: {
      ".": {
        require: "./bundled/main.cjs",
        import: "./bundled/main.js",
        types: "./typed/main.d.ts",
      },
    },
    files: ["./typed/**", "./bundled/**"],
    bin: {
      [packageNameMatch[2]]: "bundled/program.js",
    },
    scripts: {
      prepack: "node ./scripts/build.js",
      pretest: "tsc",
      build: "node ./scripts/build.js",
      clean: "node ./scripts/clean.js",
      test: "node --test ./transpiled/examples.test.js ./transpiled/mocks.test.js",
    },
    author: "",
    license: "ISC",
    dependencies: withDependencies(["@types/node", "@types/yargs", "yargs", "yaml"]),
    devDependencies: withDependencies(["typescript", "rollup", "@tsconfig/node20"]),
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
