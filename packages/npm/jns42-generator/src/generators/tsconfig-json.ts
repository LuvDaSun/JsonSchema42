export function generateTsconfigJsonData() {
  const content = {
    extends: "@tsconfig/node20",
    compilerOptions: {
      rootDir: "./src",
      outDir: "./transpiled",
      declarationDir: "./typed",
      sourceMap: true,
      declaration: true,
      composite: true,
      lib: ["es2023"],
    },
    include: ["src/**/*"],
  };
  return content;
}
