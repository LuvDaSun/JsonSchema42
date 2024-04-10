import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "../utils/foreign-object.js";
import { Sentence } from "./sentence.js";
import { withErrorReference } from "./with-error.js";

export class Names extends ForeignObject {
  constructor(pointer: number) {
    super(pointer, () => mainFfi.exports.names_drop(pointer));
  }

  public getName(key: number) {
    const resultPointer = withErrorReference((errorReferencePointer) =>
      mainFfi.exports.names_get_name(this.pointer, key),
    );
    using resultForeign = new Sentence(resultPointer);
    return resultForeign;
  }
}
