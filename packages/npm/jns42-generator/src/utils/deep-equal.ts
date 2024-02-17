export function deepEqual(value: unknown, otherValue: unknown) {
  if (
    typeof value === "object" &&
    typeof otherValue === "object" &&
    value !== null &&
    otherValue !== null
  ) {
    let keyCount = 0;
    for (const key in value) {
      keyCount++;
      if (
        key in otherValue &&
        deepEqual(value[key as keyof typeof value], otherValue[key as keyof typeof otherValue])
      ) {
        continue;
      }
      return false;
    }
    return keyCount === Object.keys(otherValue).length;
  } else {
    return value == otherValue;
  }
}
