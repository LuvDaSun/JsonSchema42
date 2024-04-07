import { mainFfi } from "../main-ffi.js";
import { Box } from "./box.js";
import { CString } from "./c-string.js";

export function reverse(value: string): string {
  using resultBoxWrapper = Box.fromTargetPointer(0);
  using valueWrapper = CString.fromString(value);
  mainFfi.exports.reverse(valueWrapper.pointer, resultBoxWrapper.pointer);
  const resultPointer = resultBoxWrapper.toTargetPointer();
  using resultWrapper = new CString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}
