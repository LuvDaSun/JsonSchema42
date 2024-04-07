import { mainFfi } from "../main-ffi.js";
import { CString } from "./c-string.js";
import { Reference } from "./reference.js";

export function reverse(value: string): string {
  using resultBoxWrapper = Reference.fromTargetPointer(0);
  using valueWrapper = CString.fromString(value);
  mainFfi.exports.reverse(valueWrapper.pointer, resultBoxWrapper.pointer);
  const resultPointer = resultBoxWrapper.toTargetPointer();
  using resultWrapper = new CString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}
