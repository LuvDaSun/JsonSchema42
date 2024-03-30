import { mainFfi } from "../main-ffi.js";
import { Out } from "./out.js";
import { SizedString } from "./sized-string.js";

export function reverse(value: string): string {
  using resultOut = Out.createNull();
  using valueString = SizedString.fromString(value);
  mainFfi.exports.reverse(valueString.pointer, resultOut.pointer);
  using resultString = SizedString.fromPointer(resultOut.reference);
  const result = resultString.toString();
  return result;
}
