import { SchemaTransform } from "../models/index.js";
import { product } from "../utils/index.js";

/**
 * Flips oneOf and allOf types. If an allOf has a oneOf in it, this transform
 * will flip em! It will become a oneOf with a few allOfs in it.
 *
 * We can generate code for a oneOf with some allOfs in it, but for an allOf with
 * a bunch of oneOfs, we cannot generate code.
 * 
 * this

```yaml
- allOf:
    - 1
    - 2
    - 3
- type: object
- oneOf:
    - 100
    - 200
- oneOf:
    - 300
    - 400
```

will become

```yaml
- oneOf:
    - 2
    - 3
    - 4
    - 5
- type: object
- allOf:
    - 1
    - 100
    - 300
- allOf:
    - 1
    - 100
    - 400
- allOf:
    - 1
    - 200
    - 300
- allOf:
    - 1
    - 200
    - 400
```
 */

export const flipAllOfOneOf = createTransform("allOf", "oneOf");
export const flipAllOfAnyOf = createTransform("allOf", "anyOf");

export const flipAnyOfAllOf = createTransform("anyOf", "allOf");
export const flipAnyOfOneOf = createTransform("anyOf", "oneOf");

export const flipOneOfAllOf = createTransform("oneOf", "allOf");
export const flipOneOfAnyOf = createTransform("oneOf", "anyOf");

function createTransform(
  baseMember: "allOf" | "anyOf" | "oneOf",
  otherMember: "allOf" | "anyOf" | "oneOf",
): SchemaTransform {
  return (arena, key) => {
    const item = arena.getItem(key);

    const baseKeys = item[baseMember];
    if (baseKeys == null) {
      return;
    }

    // we need at least two to merge
    if (baseKeys.length < 2) {
      return;
    }

    const baseItemsEntries = baseKeys.map((baseKey) => [baseKey, arena.getItem(baseKey)] as const);
    const otherKeysEntries = baseItemsEntries
      .map(([subKey, subItem]) => {
        const otherKeys = subItem[otherMember];
        if (otherKeys == null) {
          return [];
        } else {
          return otherKeys.map((subKey) => [subKey, otherKeys] as const);
        }
      })
      .filter(([subKey, otherKeys]) => {
        otherKeys.length > 0;
      });

    if (otherKeysEntries.length == 0) {
      return;
    }

    const otherKeys = Object.entries(otherKeysEntries);

    const subKeys = baseItemsEntries
      .map(([subKey]) => subKey)
      .filter((subKey) => otherKeys[subKey] != null);

    const subKeysNew = new Array<number>();

    for (const set of product(Object.values(otherKeysEntries))) {
      let subItem = {
        parent: key,
        [baseMember]: [...subKeys, ...set],
      };
      let subKey = arena.addItem(subItem);
      subKeysNew.push(subKey);
    }

    const itemNew = { ...item, [baseMember]: undefined, [otherMember]: subKeysNew };
    arena.setItem(key, itemNew);
  };
}
