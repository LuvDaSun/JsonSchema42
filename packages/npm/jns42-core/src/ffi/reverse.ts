import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER } from "../utils/index.js";
import * as wrappers from "../wrappers/index.js";

export function reverse(value: string): string {
  using outputWrapper = wrappers.Box.allocate(NULL_POINTER);
  using valueWrapper = wrappers.SizedString.allocate(value);
  mainFfi.exports.reverse(valueWrapper.pointer, outputWrapper.pointer);
  const resultPointer = mainFfi.memoryView.getInt32(outputWrapper.pointer, true);
  using resultWrapper = new wrappers.SizedString(resultPointer);
  const result = resultWrapper.read();
  assert(result != null);
  return result;
}
