import assert from "assert";
import * as ffi from "./ffi.js";

export class Out {
  private constructor(private readonly pointer: ffi.Pointer) {}

  public static createNullReference() {
    const pointer = ffi.exports.alloc(1 * 4);
    assert(pointer > 0);
    ffi.getMemoryView().setInt32(pointer, 0, true);

    const instance = new Out(pointer);
    return instance;
  }

  public getReference() {
    const reference = ffi.getMemoryView().getInt32(this.pointer, true);
    return reference;
  }

  public asPointer() {
    return this.pointer;
  }

  [Symbol.dispose]() {
    ffi.exports.dealloc(this.pointer, 1 * 4);
  }
}
