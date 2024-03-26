export function* product<T>(sets: T[][]): Iterable<T[]> {
  if (sets.length === 0) {
    return;
  }

  const indices = sets.map(() => 0);

  do {
    yield sets.map((set, index) => set[indices[index]]);

    for (let index = sets.length - 1; index >= 0; index--) {
      indices[index]++;

      if (indices[index] < sets[index].length) {
        break;
      }

      indices[index] = 0;
    }
  } while (indices.some((index) => index > 0));
}
