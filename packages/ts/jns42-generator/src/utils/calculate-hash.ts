import hashJs from "hash.js";

const cache = new WeakMap<object, string>();

export function calculateHash(target: unknown) {
  const { sha1 } = hashJs;
  const hasher = sha1();

  if (target == null) {
    return hasher.digest("hex");
  }

  switch (typeof target) {
    case "boolean":
      hasher.update([Number(target)]);
      return hasher.digest("hex");

    case "number":
      hasher.update([target]);
      return hasher.digest("hex");

    case "string":
      hasher.update(target);
      return hasher.digest("hex");

    case "object": {
      let cached = cache.get(target);
      if (cached) {
        return cached;
      }
      for (const member in target) {
        hasher.update(calculateHash(target[member as keyof typeof target]), "hex");
      }
      cached = hasher.digest("hex");
      cache.set(target, cached);
      return cached;
    }

    default:
      throw new TypeError("unexpected type of target");
  }
}
