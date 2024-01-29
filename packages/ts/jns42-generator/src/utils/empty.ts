export function isEmpty(value: unknown): boolean {
  if (value == null) {
    return true;
  }

  if (value === "") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isEmpty);
  }

  if (typeof value === "object") {
    return Object.values(value).every(isEmpty);
  }

  return false;
}
