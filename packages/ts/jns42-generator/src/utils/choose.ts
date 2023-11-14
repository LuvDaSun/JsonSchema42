/**
 * from https://stackoverflow.com/questions/64414816/can-you-return-n-choose-k-combinations-in-javascript-using-array-flatmap/64414875#64414875
 * @param arr values that we want to choose from
 * @param k number of values to choose
 * @param prefix
 * @returns all possible combinations
 */
export function choose<T>(
  arr: Array<T>,
  k: number,
  prefix: Array<T> = [],
): Array<T[]> {
  if (k == 0) return [prefix];
  return arr.flatMap((v, i) => choose(arr.slice(i + 1), k - 1, [...prefix, v]));
}
