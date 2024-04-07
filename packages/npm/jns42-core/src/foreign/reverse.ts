import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { Box } from "./box.js";
import { SizedString } from "./sized-string.js";

export function reverse(value: string): string {
  using resultBoxWrapper = Box.fromTargetPointer(0);
  using valueWrapper = SizedString.fromString(value);
  mainFfi.exports.reverse(valueWrapper.pointer, resultBoxWrapper.pointer);
  const resultPointer = resultBoxWrapper.toTargetPointer();
  assert(resultPointer != null);
  using resultWrapper = new SizedString(resultPointer);
  const result = resultWrapper.toString();
  assert(result != null);
  return result;
}
