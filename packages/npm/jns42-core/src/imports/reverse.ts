import { mainFfi } from "../main-ffi.js";
import { CString } from "./c-string.js";
import { Reference } from "./reference.js";
import { withErrorReference } from "./with-error.js";

export function reverse(value: string): string {
  using resultReferenceForeign = Reference.new(0);
  using valueForeign = CString.fromString(value);
  withErrorReference((errorReferencePointer) =>
    mainFfi.exports.reverse(
      valueForeign.pointer,
      resultReferenceForeign.pointer,
      errorReferencePointer,
    ),
  );
  using resultForeign = new CString(resultReferenceForeign.target);
  const result = resultForeign.toString();
  return result;
}
