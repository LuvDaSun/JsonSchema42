import { SchemaTransform } from "../models/index.js";
import { deepEqual } from "../utils/index.js";

export const unalias: SchemaTransform = (arena, key) => {
  const item = arena.getItem(key);

  let itemNew = item;

  if (item.reference != null) {
    itemNew = { ...itemNew, reference: arena.resolveItem(item.reference)[0] };
  }

  if (item.if != null) {
    itemNew = { ...itemNew, if: arena.resolveItem(item.if)[0] };
  }

  if (item.then != null) {
    itemNew = { ...itemNew, then: arena.resolveItem(item.then)[0] };
  }

  if (item.else != null) {
    itemNew = { ...itemNew, else: arena.resolveItem(item.else)[0] };
  }

  if (item.not != null) {
    itemNew = { ...itemNew, not: arena.resolveItem(item.not)[0] };
  }

  if (item.mapProperties != null) {
    itemNew = { ...itemNew, mapProperties: arena.resolveItem(item.mapProperties)[0] };
  }

  if (item.propertyNames != null) {
    itemNew = { ...itemNew, propertyNames: arena.resolveItem(item.propertyNames)[0] };
  }

  if (item.arrayItems != null) {
    itemNew = { ...itemNew, arrayItems: arena.resolveItem(item.arrayItems)[0] };
  }

  if (item.contains != null) {
    itemNew = { ...itemNew, contains: arena.resolveItem(item.contains)[0] };
  }

  if (item.allOf != null) {
    itemNew = { ...itemNew, allOf: item.allOf.map((key) => arena.resolveItem(key)[0]) };
  }

  if (item.anyOf != null) {
    itemNew = { ...itemNew, anyOf: item.anyOf.map((key) => arena.resolveItem(key)[0]) };
  }

  if (item.oneOf != null) {
    itemNew = { ...itemNew, oneOf: item.oneOf.map((key) => arena.resolveItem(key)[0]) };
  }

  if (item.tupleItems != null) {
    itemNew = {
      ...itemNew,
      tupleItems: item.tupleItems.map((key) => arena.resolveItem(key)[0]),
    };
  }

  if (item.dependentSchemas != null) {
    itemNew = {
      ...itemNew,
      dependentSchemas: Object.fromEntries(
        Object.entries(item.dependentSchemas).map(([name, key]) => [
          name,
          arena.resolveItem(key)[0],
        ]),
      ),
    };
  }

  if (item.objectProperties != null) {
    itemNew = {
      ...itemNew,
      objectProperties: Object.fromEntries(
        Object.entries(item.objectProperties).map(([name, key]) => [
          name,
          arena.resolveItem(key)[0],
        ]),
      ),
    };
  }

  if (item.patternProperties != null) {
    itemNew = {
      ...itemNew,
      patternProperties: Object.fromEntries(
        Object.entries(item.patternProperties).map(([name, key]) => [
          name,
          arena.resolveItem(key)[0],
        ]),
      ),
    };
  }

  if (deepEqual(item, itemNew)) {
    return;
  }

  arena.setItem(key, itemNew);
};
