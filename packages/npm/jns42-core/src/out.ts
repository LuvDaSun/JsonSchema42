import assert from "assert";
import { Pointer } from "./ffi-wrapper.js";
import { ffi } from "./ffi.js";

export class Out {
  private constructor(private readonly pointer: Pointer) {}

  public static createNullReference() {
    const pointer = ffi.exports.alloc(1 * 4);
    assert(pointer > 0);
    ffi.memoryView.setInt32(pointer, 0, true);

    const instance = new Out(pointer);
    return instance;
  }

  public getReference() {
    const reference = ffi.memoryView.getInt32(this.pointer, true);
    return reference;
  }

  public asPointer() {
    return this.pointer;
  }

  [Symbol.dispose]() {
    ffi.exports.dealloc(this.pointer, 1 * 4);
  }
}
