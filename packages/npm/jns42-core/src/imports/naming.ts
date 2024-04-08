import { mainFfi } from "../main-ffi.js";
import { CString } from "./c-string.js";
import { withErrorReference } from "./with-error.js";

export function toCamelCase(value: string) {
  using valueWrapper = CString.fromString(value);
  const resultPointer = withErrorReference((errorReferencePointer) =>
    mainFfi.exports.to_camel_case(valueWrapper.pointer, errorReferencePointer),
  );
  using resultWrapper = new CString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}

export function toPascalCase(value: string) {
  using valueWrapper = CString.fromString(value);
  const resultPointer = withErrorReference((errorReferencePointer) =>
    mainFfi.exports.to_pascal_case(valueWrapper.pointer, errorReferencePointer),
  );
  using resultWrapper = new CString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}

export function toSnakeCase(value: string) {
  using valueWrapper = CString.fromString(value);
  const resultPointer = withErrorReference((errorReferencePointer) =>
    mainFfi.exports.to_snake_case(valueWrapper.pointer, errorReferencePointer),
  );
  using resultWrapper = new CString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}

export function toScreamingSnakeCase(value: string) {
  using valueWrapper = CString.fromString(value);
  const resultPointer = withErrorReference((errorReferencePointer) =>
    mainFfi.exports.to_screaming_snake_case(valueWrapper.pointer, errorReferencePointer),
  );
  using resultWrapper = new CString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}
