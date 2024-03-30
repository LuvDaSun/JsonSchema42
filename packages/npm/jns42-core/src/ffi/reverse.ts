import { mainFfi } from "../main-ffi.js";
import { Output } from "./out.js";
import { SizedString } from "./sized-string.js";

export function reverse(value: string): string {
  using resultOutput = Output.createNull();
  using valueString = SizedString.fromString(value);
  mainFfi.exports.reverse(valueString.pointer, resultOutput.pointer);
  using resultString = SizedString.fromPointer(resultOutput.target);
  const result = resultString.toString();
  return result;
}
