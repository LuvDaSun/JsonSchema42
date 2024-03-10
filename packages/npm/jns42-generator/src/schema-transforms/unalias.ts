import { SchemaTransform } from "../models/index.js";
import { deepEqual } from "../utils/index.js";

export const unalias: SchemaTransform = (arena, key) => {
  const item = arena.getItem(key);

  let itemNew = item;

  if (item.reference != null) {
    itemNew = { ...itemNew, reference: arena.resolveKey(item.reference) };
  }

  if (item.if != null) {
    itemNew = { ...itemNew, if: arena.resolveKey(item.if) };
  }

  if (item.then != null) {
    itemNew = { ...itemNew, then: arena.resolveKey(item.then) };
  }

  if (item.else != null) {
    itemNew = { ...itemNew, else: arena.resolveKey(item.else) };
  }

  if (item.not != null) {
    itemNew = { ...itemNew, not: arena.resolveKey(item.not) };
  }

  if (item.mapProperties != null) {
    itemNew = { ...itemNew, mapProperties: arena.resolveKey(item.mapProperties) };
  }

  if (item.propertyNames != null) {
    itemNew = { ...itemNew, propertyNames: arena.resolveKey(item.propertyNames) };
  }

  if (item.arrayItems != null) {
    itemNew = { ...itemNew, arrayItems: arena.resolveKey(item.arrayItems) };
  }

  if (item.contains != null) {
    itemNew = { ...itemNew, contains: arena.resolveKey(item.contains) };
  }

  if (item.allOf != null) {
    itemNew = { ...itemNew, allOf: item.allOf.map((key) => arena.resolveKey(key)) };
  }

  if (item.anyOf != null) {
    itemNew = { ...itemNew, anyOf: item.anyOf.map((key) => arena.resolveKey(key)) };
  }

  if (item.oneOf != null) {
    itemNew = { ...itemNew, oneOf: item.oneOf.map((key) => arena.resolveKey(key)) };
  }

  if (item.tupleItems != null) {
    itemNew = {
      ...itemNew,
      tupleItems: item.tupleItems.map((key) => arena.resolveKey(key)),
    };
  }

  if (item.dependentSchemas != null) {
    itemNew = {
      ...itemNew,
      dependentSchemas: Object.fromEntries(
        Object.entries(item.dependentSchemas).map(([name, key]) => [name, arena.resolveKey(key)]),
      ),
    };
  }

  if (item.objectProperties != null) {
    itemNew = {
      ...itemNew,
      objectProperties: Object.fromEntries(
        Object.entries(item.objectProperties).map(([name, key]) => [name, arena.resolveKey(key)]),
      ),
    };
  }

  if (item.patternProperties != null) {
    itemNew = {
      ...itemNew,
      patternProperties: Object.fromEntries(
        Object.entries(item.patternProperties).map(([name, key]) => [name, arena.resolveKey(key)]),
      ),
    };
  }

  if (deepEqual(item, itemNew)) {
    return;
  }

  arena.setItem(key, itemNew);
};
