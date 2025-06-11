import { PackageJson } from "type-fest";
import { readPackageInfo } from "../utilities.js";

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
    files: ["./typed/**", "./bundled/**", "./bin/**"],
    bin: {
      [packageNameMatch[2]]: "bin/program.js",
    },
    scripts: {
      prepack: "node ./scripts/build.js",
      pretest: "tsc --build",
      build: "node ./scripts/build.js",
      test: "node --test ./transpiled/examples.test.js ./transpiled/mocks.test.js",
      program: "node ./bundled/program.js",
    },
    author: "",
    license: "ISC",
    dependencies: withDependencies(["@types/node", "@jns42/lib", "@types/yargs", "yargs"]),
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
  const packageInfo = readPackageInfo();

  return names.reduce(
    (o, name) =>
      Object.assign(o, {
        [name]: packageInfo.dependencies?.[name] ?? packageInfo.devDependencies?.[name],
      }),
    {},
  );
}
