let lastKey = 0;
export function newKey() {
  lastKey++;
  return lastKey;
}
