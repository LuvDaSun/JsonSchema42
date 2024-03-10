import { SchemaTransform } from "../models/index.js";
import { deepEqual } from "../utils/index.js";

export const unalias: SchemaTransform = (arena, key) => {
  const item = arena.getItem(key);

  let itemNew = item;

  if (item.reference != null) {
    itemNew = { ...itemNew, reference: resolveKey(item.reference) };
  }

  if (item.if != null) {
    itemNew = { ...itemNew, if: resolveKey(item.if) };
  }

  if (item.then != null) {
    itemNew = { ...itemNew, then: resolveKey(item.then) };
  }

  if (item.else != null) {
    itemNew = { ...itemNew, else: resolveKey(item.else) };
  }

  if (item.not != null) {
    itemNew = { ...itemNew, not: resolveKey(item.not) };
  }

  if (item.mapProperties != null) {
    itemNew = { ...itemNew, mapProperties: resolveKey(item.mapProperties) };
  }

  if (item.propertyNames != null) {
    itemNew = { ...itemNew, propertyNames: resolveKey(item.propertyNames) };
  }

  if (item.arrayItems != null) {
    itemNew = { ...itemNew, arrayItems: resolveKey(item.arrayItems) };
  }

  if (item.contains != null) {
    itemNew = { ...itemNew, contains: resolveKey(item.contains) };
  }

  if (item.allOf != null) {
    itemNew = { ...itemNew, allOf: item.allOf.map((key) => resolveKey(key)) };
  }

  if (item.anyOf != null) {
    itemNew = { ...itemNew, anyOf: item.anyOf.map((key) => resolveKey(key)) };
  }

  if (item.oneOf != null) {
    itemNew = { ...itemNew, oneOf: item.oneOf.map((key) => resolveKey(key)) };
  }

  if (item.tupleItems != null) {
    itemNew = {
      ...itemNew,
      tupleItems: item.tupleItems.map((key) => resolveKey(key)),
    };
  }

  if (item.dependentSchemas != null) {
    itemNew = {
      ...itemNew,
      dependentSchemas: Object.fromEntries(
        Object.entries(item.dependentSchemas).map(([name, key]) => [name, resolveKey(key)]),
      ),
    };
  }

  if (item.objectProperties != null) {
    itemNew = {
      ...itemNew,
      objectProperties: Object.fromEntries(
        Object.entries(item.objectProperties).map(([name, key]) => [name, resolveKey(key)]),
      ),
    };
  }

  if (item.patternProperties != null) {
    itemNew = {
      ...itemNew,
      patternProperties: Object.fromEntries(
        Object.entries(item.patternProperties).map(([name, key]) => [name, resolveKey(key)]),
      ),
    };
  }

  if (deepEqual(item, itemNew)) {
    return;
  }

  arena.setItem(key, itemNew);

  function resolveKey(key: number): number {
    let resolvedKey = key;
    let resolvedItem = arena.getItem(resolvedKey);
    while (true) {
      if (resolvedItem.reference == null) {
        break;
      }
      // the original parent of this item
      if (resolvedItem.parent != null) {
        break;
      }

      if (resolvedItem.types != null && resolvedItem.types.length > 0) {
        break;
      }

      if (resolvedItem.if != null) {
        break;
      }

      if (resolvedItem.then != null) {
        break;
      }

      if (resolvedItem.else != null) {
        break;
      }

      if (resolvedItem.not != null) {
        break;
      }

      if (resolvedItem.mapProperties != null) {
        break;
      }

      if (resolvedItem.arrayItems != null) {
        break;
      }

      if (resolvedItem.propertyNames != null) {
        break;
      }

      if (resolvedItem.contains != null) {
        break;
      }

      if (resolvedItem.oneOf != null && resolvedItem.oneOf.length > 0) {
        break;
      }

      if (resolvedItem.anyOf != null && resolvedItem.anyOf.length > 0) {
        break;
      }

      if (resolvedItem.allOf != null && resolvedItem.allOf.length > 0) {
        break;
      }

      if (resolvedItem.tupleItems != null && resolvedItem.tupleItems.length > 0) {
        break;
      }

      if (
        resolvedItem.objectProperties != null &&
        Object.keys(resolvedItem.objectProperties).length > 0
      ) {
        break;
      }

      if (
        resolvedItem.patternProperties != null &&
        Object.keys(resolvedItem.patternProperties).length > 0
      ) {
        break;
      }

      if (
        resolvedItem.dependentSchemas != null &&
        Object.keys(resolvedItem.dependentSchemas).length > 0
      ) {
        break;
      }

      if (resolvedItem.options != null && resolvedItem.options.length > 0) {
        break;
      }

      if (resolvedItem.required != null && resolvedItem.required.length > 0) {
        break;
      }

      if (resolvedItem.minimumInclusive != null) {
        break;
      }

      if (resolvedItem.minimumExclusive != null) {
        break;
      }

      if (resolvedItem.maximumInclusive != null) {
        break;
      }

      if (resolvedItem.maximumExclusive != null) {
        break;
      }

      if (resolvedItem.multipleOf != null) {
        break;
      }

      if (resolvedItem.minimumLength != null) {
        break;
      }

      if (resolvedItem.maximumLength != null) {
        break;
      }

      if (resolvedItem.valuePattern != null && resolvedItem.valuePattern.length > 0) {
        break;
      }

      if (resolvedItem.valueFormat != null && resolvedItem.valueFormat.length > 0) {
        break;
      }

      if (resolvedItem.minimumItems != null) {
        break;
      }

      if (resolvedItem.maximumItems != null) {
        break;
      }

      if (resolvedItem.uniqueItems != null) {
        break;
      }

      if (resolvedItem.minimumProperties != null) {
        break;
      }

      if (resolvedItem.maximumProperties != null) {
        break;
      }

      resolvedKey = resolvedItem.reference;
      resolvedItem = arena.getItem(resolvedKey);
    }
    return resolvedKey;
  }
};
