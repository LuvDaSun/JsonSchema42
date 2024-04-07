import { mainFfi } from "../main-ffi.js";
import { SizedString } from "./sized-string.js";

export function toCamelCase(value: string) {
  using valueWrapper = SizedString.fromString(value);
  const resultPointer = mainFfi.exports.to_camel_case(valueWrapper.pointer);
  using resultWrapper = new SizedString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}

export function toPascalCase(value: string) {
  using valueWrapper = SizedString.fromString(value);
  const resultPointer = mainFfi.exports.to_pascal_case(valueWrapper.pointer);
  using resultWrapper = new SizedString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}

export function toSnakeCase(value: string) {
  using valueWrapper = SizedString.fromString(value);
  const resultPointer = mainFfi.exports.to_snake_case(valueWrapper.pointer);
  using resultWrapper = new SizedString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}

export function toScreamingSnakeCase(value: string) {
  using valueWrapper = SizedString.fromString(value);
  const resultPointer = mainFfi.exports.to_screaming_snake_case(valueWrapper.pointer);
  using resultWrapper = new SizedString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}
