import * as core from "@jns42/core";

export function isMockable(arena: core.SchemaArena, key: number) {
  const item = arena.getItem(key);
  const itemValue = item.toValue();

  // the counter keeps track of of this item is unknown or not. If the counter is 0
  // then the item has no meaningful mockable elements (often only validation).
  let mockableCounter = 0;

  // we can only mock exact items
  if (!(itemValue.exact ?? false)) {
    return false;
  }

  // we might support this one day
  if (itemValue.uniqueItems != null) {
    return false;
  }

  // one day we might support some formats
  if (itemValue.valueFormat != null) {
    return false;
  }

  // anything with a regex cannot be mocked
  if (itemValue.valuePattern != null) {
    return false;
  }

  if (itemValue.types != null) {
    // we cannot mock never and any types
    if (itemValue.types.every((type) => type === "never" || type === "any")) {
      return false;
    }
    mockableCounter++;
  }

  if (itemValue.reference != null) {
    if (!isMockable(arena, itemValue.reference)) {
      return false;
    }
    mockableCounter++;
  }

  if (itemValue.if != null) {
    return false;
  }
  if (itemValue.then != null) {
    return false;
  }
  if (itemValue.else != null) {
    return false;
  }
  if (itemValue.not != null) {
    return false;
  }

  if (itemValue.mapProperties != null) {
    if (!isMockable(arena, itemValue.mapProperties)) {
      return false;
    }

    // we should not increase the mockableCounter for these kinds of
    // fields as they are not making the item more mockable
  }

  if (itemValue.arrayItems != null) {
    if (!isMockable(arena, itemValue.arrayItems)) {
      return false;
    }
  }

  if (itemValue.propertyNames != null) {
    if (!isMockable(arena, itemValue.propertyNames)) {
      return false;
    }
  }

  if (itemValue.contains != null) {
    return false;
  }

  if (itemValue.oneOf != null && itemValue.oneOf.length > 0) {
    if (!itemValue.oneOf.some((key) => isMockable(arena, key))) {
      return false;
    }
    mockableCounter++;
  }

  if (itemValue.anyOf != null && itemValue.anyOf.length > 0) {
    return false;
  }

  if (itemValue.allOf != null && itemValue.allOf.length > 0) {
    return false;
  }

  if (itemValue.objectProperties != null && Object.keys(itemValue.objectProperties).length > 0) {
    const required = new Set(itemValue.required);
    if (
      !Object.entries(itemValue.objectProperties)
        .filter(([name, key]) => required.has(name))
        .every(([name, key]) => isMockable(arena, key))
    ) {
      return false;
    }
  }

  // anything with a regex cannot be mocked
  if (itemValue.patternProperties != null && Object.keys(itemValue.patternProperties).length > 0) {
    return false;
  }
  if (itemValue.dependentSchemas != null && Object.keys(itemValue.dependentSchemas).length > 0) {
    return false;
  }

  return mockableCounter > 0;
}
