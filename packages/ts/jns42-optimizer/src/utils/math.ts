// Euclidean Algorithm

export function findMultipleOf(a: number, b: number) {
  return (a * b) / findGreatestCommonDivisor(a, b);
}

export function findGreatestCommonDivisor(a: number, b: number) {
  var t;
  while (b !== 0) {
    t = a % b;
    a = b;
    b = t;
  }
  return a;
}
