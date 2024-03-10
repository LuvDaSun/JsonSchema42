import { findMultipleOf } from "./math.js";

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

export function exclude<T>(
  values: T[] | undefined,
  excludeValues: T[] | undefined,
): T[] | undefined {
  if (values == null) {
    return;
  }

  if (excludeValues == null) {
    return values;
  }

  const set = new Set(excludeValues);
  return values.filter((value) => !set.has(value));
}

export function mergeKeysRecord(
  keys: Record<string, number> | undefined,
  otherKeys: Record<string, number> | undefined,
  mergeKey: (key: number | undefined, otherKey: number | undefined) => number | undefined,
): Record<string, number> | undefined {
  if (keys === otherKeys) {
    return keys;
  }

  if (keys == null) {
    return otherKeys;
  }

  if (otherKeys == null) {
    return keys;
  }

  const resultKeys: Record<string, number> = {};
  const propertyNames = new Set([...Object.keys(keys), ...Object.keys(otherKeys)]);
  for (const propertyName of propertyNames) {
    const key = mergeKey(keys[propertyName], otherKeys[propertyName]);
    if (key == null) {
      continue;
    }
    resultKeys[propertyName] = key;
  }
  return resultKeys;
}

export function booleanMergeOr(
  value: boolean | undefined,
  otherValue: boolean | undefined,
): boolean | undefined {
  if (value == null) {
    return otherValue;
  }

  if (otherValue == null) {
    return value;
  }

  return value || otherValue;
}

export function booleanMergeAnd(
  value: boolean | undefined,
  otherValue: boolean | undefined,
): boolean | undefined {
  if (value == null) {
    return otherValue;
  }

  if (otherValue == null) {
    return value;
  }

  return value && otherValue;
}

export function numericMergeMinimum(
  value: number | undefined,
  otherValue: number | undefined,
): number | undefined {
  if (value == null) {
    return otherValue;
  }

  if (otherValue == null) {
    return value;
  }

  if (otherValue < value) {
    return otherValue;
  }

  return value;
}

export function numericMergeMaximum(
  value: number | undefined,
  otherValue: number | undefined,
): number | undefined {
  if (value == null) {
    return otherValue;
  }

  if (otherValue == null) {
    return value;
  }

  if (otherValue > value) {
    return otherValue;
  }
}

export function numericMergeMultipleOf(
  value: number | undefined,
  otherValue: number | undefined,
): number | undefined {
  if (value == null) {
    return otherValue;
  }

  if (otherValue == null) {
    return value;
  }

  return findMultipleOf(value, otherValue);
}
