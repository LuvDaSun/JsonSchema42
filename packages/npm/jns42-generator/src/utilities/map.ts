import assert from "node:assert";

export function getMapItemProperty<K, V, P extends keyof V>(
  map: Map<K, V>,
  property: P,
  key?: K,
): undefined | V[P] {
  if (key == null) {
    return;
  }

  const item = map.get(key);
  assert(item != null);

  return item[property];
}
