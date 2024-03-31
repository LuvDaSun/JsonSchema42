import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { Structure2 } from "./structure-2.js";

export class BooleanStructure extends Structure2 {
  public get value(): boolean | undefined {
    if (this.pointer === NULL_POINTER) {
      return undefined;
    } else {
      return Boolean(this.getInt8(0));
    }
  }
  public set value(value: boolean | undefined) {
    if (value == null) {
      this.reallocate(0);
    } else {
      this.reallocate(1);
      this.setInt8(0, Number(value));
    }
  }

  protected constructor(pointer: Pointer) {
    super(pointer, 1);
  }
}
