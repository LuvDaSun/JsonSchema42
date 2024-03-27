import { mainFfi } from "../main-ffi.js";
import { Out } from "./out.js";
import { PascalString } from "./pascal-string.js";

export function reverse(value: string): string {
  using resultOut = Out.createNull();
  using valuePascalString = PascalString.fromString(value);
  mainFfi.exports.reverse(valuePascalString.asPointer(), resultOut.asPointer());
  using resultPascalString = PascalString.fromPointer(resultOut.reference);
  const result = resultPascalString.toString();
  return result;
}
