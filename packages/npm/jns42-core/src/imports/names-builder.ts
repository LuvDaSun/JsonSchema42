import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "../utils/foreign-object.js";
import { CString } from "./c-string.js";
import { Names } from "./names.js";
import { VecString } from "./vec-string.js";
import { withErrorReference } from "./with-error.js";

export class NamesBuilder extends ForeignObject {
  constructor(pointer: number) {
    super(pointer, () => mainFfi.exports.names_builder_drop(pointer));
  }

  public static new() {
    const pointer = mainFfi.exports.names_builder_new();
    return new NamesBuilder(pointer);
  }

  public add(key: number, values: string[]) {
    using valuesForeign = VecString.fromArray(values);

    mainFfi.exports.names_builder_add(this.pointer, key, valuesForeign.pointer);

    return this;
  }

  public setDefaultName(value: string) {
    using valueForeign = CString.fromString(value);

    withErrorReference((errorReferencePointer) =>
      mainFfi.exports.names_builder_set_default_name(
        this.pointer,
        valueForeign.pointer,
        errorReferencePointer,
      ),
    );

    return this;
  }

  public build() {
    const pointer = mainFfi.exports.names_builder_build(this.pointer);
    return new Names(pointer);
  }
}
