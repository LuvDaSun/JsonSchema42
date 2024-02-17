import { calculateHash } from "./calculate-hash.js";
import { deepEqual } from "./deep-equal.js";

export function* deepUnique<T>(list: Iterable<T>): Iterable<T> {
  // first index by hash
  const hashed: Record<string, T[]> = {};
  for (const item of list) {
    const hash = calculateHash(item);
    hashed[hash] ??= [];
    hashed[hash].push(item);
  }

  for (const hash in hashed) {
    const items = hashed[hash];

    let item: T | undefined;
    while ((item = items.shift()) !== undefined) {
      if (items.some((otherItem) => deepEqual(item, otherItem))) {
        // this item is the same as another item in the list,
        // don't emit it!
        continue;
      }
      yield item;
    }
  }
}
