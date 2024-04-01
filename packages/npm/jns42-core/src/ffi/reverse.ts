import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { Output } from "./output.js";
import { SizedString } from "./sized-string.js";

export function reverse(value: string): string {
  using resultOutput = new Output();
  using valueString = new SizedString();
  valueString.value = value;
  mainFfi.exports.reverse(valueString.getPointer(), resultOutput.getPointer());
  using resultString = new SizedString(resultOutput.targetPointer);
  const result = resultString.value;
  assert(result != null);
  return result;
}
