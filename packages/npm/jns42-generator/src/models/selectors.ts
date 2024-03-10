import { SchemaItem } from "./item.js";

/**
 * retrieves dependencies of a schema model
 *
 * @param model the schema to get dependencies
 */
export function* selectSchemaDependencies(model: SchemaItem) {
  if (model.reference != null) {
    yield model.reference;
  }
  if (model.if != null) {
    yield model.if;
  }
  if (model.then != null) {
    yield model.then;
  }
  if (model.else != null) {
    yield model.else;
  }
  if (model.not != null) {
    yield model.not;
  }
  if (model.mapProperties != null) {
    yield model.mapProperties;
  }
  if (model.propertyNames != null) {
    yield model.propertyNames;
  }
  if (model.arrayItems != null) {
    yield model.arrayItems;
  }
  if (model.contains != null) {
    yield model.contains;
  }

  yield* model.oneOf ?? [];
  yield* model.anyOf ?? [];
  yield* model.allOf ?? [];
  yield* model.tupleItems ?? [];

  yield* Object.entries(model.dependentSchemas ?? {}).map(([name, key]) => key);
  yield* Object.entries(model.objectProperties ?? {}).map(([name, key]) => key);
  yield* Object.entries(model.patternProperties ?? {}).map(([name, key]) => key);
}
