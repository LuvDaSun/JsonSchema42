import { PackageJson } from "type-fest";
import { packageInfo } from "../utils/index.js";

export function getPackageJsonData(name: string, version: string) {
  const content: PackageJson = {
    name,
    version,
    sideEffects: false,
    type: "module",
    main: "./out-commonjs/main.js",
    module: "./out/main.js",
    types: "./out/main.d.ts",
    exports: {
      ".": {
        require: "./out-commonjs/main.js",
        import: "./out/main.js",
        types: "./out/main.d.ts",
      },
    },
    files: ["./out/**", "./out-commonjs/**"],
    scripts: {
      prepack: `tsc ; tsc --outDir out-commonjs --declaration false --module commonjs --moduleResolution Node10 ; echo '{"type":"commonjs"}' > out-commonjs/package.json`,
      pretest: `tsc ; tsc --outDir out-commonjs --declaration false --module commonjs --moduleResolution Node10 ; echo '{"type":"commonjs"}' > out-commonjs/package.json`,
      build: `tsc ; tsc --outDir out-commonjs --declaration false --module commonjs --moduleResolution Node10 ; echo '{"type":"commonjs"}' > out-commonjs/package.json`,
      clean: "rm -rf out out-*",
      test: "node --test ./out/**/*.test.js",
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
