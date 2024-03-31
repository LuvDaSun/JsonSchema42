import { mainFfi } from "../main-ffi.js";
import { Output } from "./output.js";
import { SizedString2 } from "./sized-string-2.js";

export function reverse(value: string): string {
  using resultOutput = Output.createNull();
  using valueString = new SizedString2();
  valueString.value = value;
  mainFfi.exports.reverse(valueString.pointer, resultOutput.pointer);
  using resultString = new SizedString2(resultOutput.targetPointer);
  const result = resultString.value!;
  return result;
}
