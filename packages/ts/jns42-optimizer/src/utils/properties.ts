export function hasProperties<T extends object>(
  obj: T,
  required: (keyof T)[],
  optional: (keyof T)[] = [],
) {
  let requiredCount = 0;
  for (const property in obj) {
    if (obj[property] === undefined) {
      continue;
    }

    if (required.indexOf(property) >= 0) {
      requiredCount++;
      continue;
    }

    if (optional.indexOf(property) >= 0) {
      continue;
    }

    return false;
  }

  if (requiredCount < required.length) {
    return false;
  }

  return true;
}
