export function intersectionMerge<T>(
  values: T[] | undefined,
  otherValues: T[] | undefined,
): T[] | undefined {
  if (values == null) {
    return otherValues;
  }

  if (otherValues == null) {
    return values;
  }

  const result = new Array<T>();
  const set = new Set(otherValues);
  for (const value of values) {
    if (set.has(value)) {
      result.push(value);
    }
  }

  return result;
}

export function unionMerge<T>(
  values: T[] | undefined,
  otherValues: T[] | undefined,
): T[] | undefined {
  if (values == null) {
    return otherValues;
  }

  if (otherValues == null) {
    return values;
  }

  const set = new Set(otherValues);
  for (const value of values) {
    set.add(value);
  }
  return [...set];
}
