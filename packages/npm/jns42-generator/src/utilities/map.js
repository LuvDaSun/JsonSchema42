import assert from "node:assert";
export function getMapItemProperty(map, property, key) {
    if (key == null) {
        return;
    }
    const item = map.get(key);
    assert(item != null);
    return item[property];
}
