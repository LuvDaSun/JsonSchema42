import { mainFfi } from "../main-ffi.js";
import { Box } from "./box.js";
import { SizedString } from "./sized-string.js";

export function reverse(value: string): string {
  using resultBoxWrapper = Box.fromTargetPointer(0);
  using valueWrapper = SizedString.fromString(value);
  mainFfi.exports.reverse(valueWrapper.pointer, resultBoxWrapper.pointer);
  const resultPointer = resultBoxWrapper.toTargetPointer();
  using resultWrapper = new SizedString(resultPointer);
  const result = resultWrapper.toString();
  return result;
}
