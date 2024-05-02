import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "../utils/foreign-object.js";
import { CString } from "./c-string.js";
import { ArenaSchemaItemValue } from "./schema-item.js";
import { withErrorReference } from "./with-error.js";

export class ArenaSchemaItem extends ForeignObject {
  constructor(pointer: number) {
    super(pointer, () => mainFfi.exports.arena_schema_item_drop(pointer));
  }

  public toValue(): ArenaSchemaItemValue {
    const resultPointer = withErrorReference((errorReferencePointer) =>
      mainFfi.exports.arena_schema_item_json(this.pointer, errorReferencePointer),
    );
    using resultForeign = new CString(resultPointer);
    const resultString = resultForeign.toString();
    const result = JSON.parse(resultString);
    return result;
  }

  public get location() {
    if (Boolean(mainFfi.exports.arena_schema_item_has_location(this.pointer))) {
      const resultPointer = withErrorReference((errorReferencePointer) =>
        mainFfi.exports.arena_schema_item_get_location(this.pointer, errorReferencePointer),
      );
      using resultForeign = new CString(resultPointer);
      const resultString = resultForeign.toString();
      return resultString;
    } else {
      return null;
    }
  }
}
