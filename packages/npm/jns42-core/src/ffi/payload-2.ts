import { NULL_POINTER, Pointer, Size } from "../utils/ffi.js";
import { Structure2 } from "./structure-2.js";

export class Payload2 extends Structure2 {
  public get value(): Uint8Array | undefined {
    if (this.pointer === NULL_POINTER) {
      return undefined;
    } else {
      const value = this.getBytes();
      return value;
    }
  }
  public set value(value: Uint8Array | undefined) {
    if (value == null) {
      this.reallocate(0);
    } else {
      this.reallocate(value.length);
      this.setBytes(value);
    }
  }

  public constructor(pointer: Pointer = NULL_POINTER, size: Size = 0) {
    super(pointer, size);
  }
}
