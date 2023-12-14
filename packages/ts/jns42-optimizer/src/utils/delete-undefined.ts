/**
 * deeply removes undefined from objects while mutating the given target
 *
 * @param target the object to remove undefined from
 * @returns object without undefined
 */
export function deleteUndefined<T>(target: T): T {
  if (typeof target === "object" && target !== null) {
    for (const name in target) {
      if (target[name] === undefined) {
        delete target[name];
        continue;
      }

      deleteUndefined(target[name]);
    }
  }

  return target;
}
