import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER } from "../utils/index.js";
import { PointerWrapper } from "./pointer-wrapper.js";
import { SizedStringWrapper } from "./sized-string-wrapper.js";

export function reverse(value: string): string {
  using outputWrapper = PointerWrapper.allocate(NULL_POINTER);
  using valueWrapper = SizedStringWrapper.allocate(value);
  mainFfi.exports.reverse(valueWrapper.pointer, outputWrapper.pointer);
  const resultPointer = mainFfi.memoryView.getInt32(outputWrapper.pointer, true);
  using resultWrapper = new SizedStringWrapper(resultPointer);
  const result = resultWrapper.read();
  assert(result != null);
  return result;
}
