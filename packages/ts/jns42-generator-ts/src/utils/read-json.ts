export function* readJson(
  prefix: string,
  node: unknown,
): Iterable<[string, unknown]> {
  yield [prefix, node];

  if (node != null && typeof node === "object") {
    for (const key in node) {
      yield* readJson(
        prefix + "/" + encodeURIComponent(key),
        node[key as keyof typeof node],
      );
    }
  }
}
