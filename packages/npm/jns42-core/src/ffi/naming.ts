import assert from "node:assert";
import { mainFfi } from "../main-ffi.js";
import * as wrappers from "../wrappers/index.js";

export function toCamelCase(value: string) {
  using valueWrapper = wrappers.SizedString.allocate(value);
  const resultPointer = mainFfi.exports.to_camel_case(valueWrapper.pointer);
  using resultWrapper = new wrappers.SizedString(resultPointer);
  const result = resultWrapper.read();
  assert(result != null);
  return result;
}

export function toPascalCase(value: string) {
  using valueWrapper = wrappers.SizedString.allocate(value);
  const resultPointer = mainFfi.exports.to_pascal_case(valueWrapper.pointer);
  using resultWrapper = new wrappers.SizedString(resultPointer);
  const result = resultWrapper.read();
  assert(result != null);
  return result;
}

export function toSnakeCase(value: string) {
  using valueWrapper = wrappers.SizedString.allocate(value);
  const resultPointer = mainFfi.exports.to_snake_case(valueWrapper.pointer);
  using resultWrapper = new wrappers.SizedString(resultPointer);
  const result = resultWrapper.read();
  assert(result != null);
  return result;
}

export function toScreamingSnakeCase(value: string) {
  using valueWrapper = wrappers.SizedString.allocate(value);
  const resultPointer = mainFfi.exports.to_screaming_snake_case(valueWrapper.pointer);
  using resultWrapper = new wrappers.SizedString(resultPointer);
  const result = resultWrapper.read();
  assert(result != null);
  return result;
}
