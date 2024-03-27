import { mainFfi } from "../main-ffi.js";
import { Out } from "./out.js";
import { PascalString } from "./pascal-string.js";

export function reverse(value: string): string {
  using resultOut = Out.createNullReference();
  using valuePascalString = PascalString.fromString(value);
  mainFfi.exports.reverse(valuePascalString.asPointer(), resultOut.asPointer());
  using resultPascalString = PascalString.fromPointer(resultOut.getReference());
  const result = resultPascalString.toString();
  return result;
}
