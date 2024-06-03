import * as core from "@jns42/core";

export function isMockable(arena: core.SchemaArenaContainer, key: number) {
  const item = arena.getItem(key);

  // the counter keeps track of of this item is unknown or not. If the counter is 0
  // then the item has no meaningful mockable elements (often only validation).
  let mockableCounter = 0;

  // we can only mock exact items
  if (!(item.exact ?? false)) {
    return false;
  }

  // we might support this one day
  if (item.uniqueItems != null) {
    return false;
  }

  // one day we might support some formats
  if (item.valueFormat != null) {
    return false;
  }

  // anything with a regex cannot be mocked
  if (item.valuePattern != null) {
    return false;
  }

  if (item.types != null) {
    // we cannot mock never and any types
    if (item.types.every((type) => type === "never" || type === "any")) {
      return false;
    }
    mockableCounter++;
  }

  if (item.reference != null) {
    if (!isMockable(arena, item.reference)) {
      return false;
    }
    mockableCounter++;
  }

  if (item.ifSchema != null) {
    return false;
  }
  if (item.thenSchema != null) {
    return false;
  }
  if (item.elseSchema != null) {
    return false;
  }
  if (item.not != null) {
    return false;
  }

  if (item.mapProperties != null) {
    if (!isMockable(arena, item.mapProperties)) {
      return false;
    }

    // we should not increase the mockableCounter for these kinds of
    // fields as they are not making the item more mockable
  }

  if (item.arrayItems != null) {
    if (!isMockable(arena, item.arrayItems)) {
      return false;
    }
  }

  if (item.propertyNames != null) {
    if (!isMockable(arena, item.propertyNames)) {
      return false;
    }
  }

  if (item.contains != null) {
    return false;
  }

  if (item.oneOf != null && item.oneOf.length > 0) {
    if (!item.oneOf.some((key) => isMockable(arena, key))) {
      return false;
    }
    mockableCounter++;
  }

  if (item.anyOf != null && item.anyOf.length > 0) {
    return false;
  }

  if (item.allOf != null && item.allOf.length > 0) {
    return false;
  }

  if (item.objectProperties != null && Object.keys(item.objectProperties).length > 0) {
    const required = new Set(item.required);
    if (
      !Object.entries(item.objectProperties)
        .filter(([name, key]) => required.has(name))
        .every(([name, key]) => isMockable(arena, key))
    ) {
      return false;
    }
  }

  // anything with a regex cannot be mocked
  if (item.patternProperties != null && Object.keys(item.patternProperties).length > 0) {
    return false;
  }
  if (item.dependentSchemas != null && Object.keys(item.dependentSchemas).length > 0) {
    return false;
  }

  return mockableCounter > 0;
}
