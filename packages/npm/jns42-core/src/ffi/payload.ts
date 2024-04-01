import { NULL_POINTER, Pointer, Size } from "../utils/ffi.js";
import { Structure } from "./structure.js";

export class Payload extends Structure {
  public get value(): Uint8Array {
    const value = this.getBytes();
    return value;
  }
  public set value(value: Uint8Array) {
    this.setSize(value.length);
    this.setBytes(value);
  }

  public constructor(pointer: Pointer = NULL_POINTER, size: Size = 0) {
    super(pointer, size);
  }
}
