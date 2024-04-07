import { mainFfi } from "../main-ffi.js";
import { CString } from "./c-string.js";
import { Reference } from "./reference.js";

export function reverse(value: string): string {
  using resultReferenceForeign = Reference.new(0);
  using valueForeign = CString.fromString(value);
  mainFfi.exports.reverse(valueForeign.pointer, resultReferenceForeign.pointer);
  using resultWrapper = new CString(resultReferenceForeign.target);
  const result = resultWrapper.toString();
  return result;
}
