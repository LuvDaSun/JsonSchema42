import { mainFfi } from "../main-ffi.js";
import { Out } from "./out.js";
import { Utf8String } from "./string.js";

export function reverse(value: string): string {
  using resultOut = Out.createNull();
  using valueString = Utf8String.fromString(value);
  mainFfi.exports.reverse(valueString.pointer, resultOut.pointer);
  using resultString = Utf8String.fromPointer(resultOut.reference);
  const result = resultString.toString();
  return result;
}
