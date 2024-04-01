import { mainFfi } from "../main-ffi.js";
import { SizedStringWrapper } from "./sized-string-wrapper.js";

export function toCamelCase(value: string) {
  using valueWrapper = SizedStringWrapper.allocate(value);
  const resultPointer = mainFfi.exports.to_camel_case(valueWrapper.pointer);
  using resultWrapper = new SizedStringWrapper(resultPointer);
  const result = resultWrapper.read();
  return result;
}

export function toPascalCase(value: string) {
  using valueWrapper = SizedStringWrapper.allocate(value);
  const resultPointer = mainFfi.exports.to_pascal_case(valueWrapper.pointer);
  using resultWrapper = new SizedStringWrapper(resultPointer);
  const result = resultWrapper.read();
  return result;
}

export function toSnakeCase(value: string) {
  using valueWrapper = SizedStringWrapper.allocate(value);
  const resultPointer = mainFfi.exports.to_snake_case(valueWrapper.pointer);
  using resultWrapper = new SizedStringWrapper(resultPointer);
  const result = resultWrapper.read();
  return result;
}

export function toScreamingSnakeCase(value: string) {
  using valueWrapper = SizedStringWrapper.allocate(value);
  const resultPointer = mainFfi.exports.to_screaming_snake_case(valueWrapper.pointer);
  using resultWrapper = new SizedStringWrapper(resultPointer);
  const result = resultWrapper.read();
  return result;
}
