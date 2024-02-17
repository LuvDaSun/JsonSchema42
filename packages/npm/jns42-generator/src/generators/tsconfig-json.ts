export function getTsconfigJsonData() {
  const content = {
    extends: "@tsconfig/node20",
    compilerOptions: {
      outDir: "./out",
      rootDir: "./src",
      sourceMap: true,
      declaration: true,
      composite: true,
      lib: ["ES2023"],
    },
    include: ["src"],
  };

  return content;
}
