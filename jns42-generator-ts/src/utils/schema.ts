export function discoverSchemaId(node: unknown) {
  if (node == null) {
    return null;
  }

  if (typeof node !== "object") {
    return null;
  }

  if (!("$schema" in node)) {
    return null;
  }

  if (typeof node.$schema !== "string") {
    return null;
  }

  return node.$schema;
}
