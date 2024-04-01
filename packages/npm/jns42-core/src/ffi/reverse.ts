import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER } from "../utils/index.js";
import { Output } from "./output.js";
import { SizedString } from "./sized-string.js";

export function reverse(value: string): string {
  using outputWrapper = Output.allocate(NULL_POINTER);
  using valueWrapper = SizedString.allocate(value);
  mainFfi.exports.reverse(valueWrapper.pointer, outputWrapper.pointer);
  const resultPointer = mainFfi.memoryView.getInt32(outputWrapper.pointer, true);
  using resultWrapper = new SizedString(resultPointer);
  return resultWrapper.read();
}
