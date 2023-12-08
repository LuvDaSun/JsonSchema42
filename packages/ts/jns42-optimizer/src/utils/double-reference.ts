export function hasDoubleReference(target: unknown, seen = new Set<object>()) {
  if (target == null) {
    return false;
  }

  switch (typeof target) {
    case "object": {
      if (seen.has(target)) {
        return true;
      }
      seen.add(target);

      for (const subTarget of Object.values(target)) {
        if (hasDoubleReference(subTarget, seen)) {
          return true;
        }
      }
      return false;
    }

    default:
      return false;
  }
}
