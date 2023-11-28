export function getTsconfigJsonData() {
  const content = {
    extends: "@tsconfig/node20",
    compilerOptions: {
      sourceMap: true,
      declaration: true,
      composite: true,
      lib: ["es2023"],
    },
  };

  return content;
}
