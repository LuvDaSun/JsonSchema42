import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { Pointer } from "../utils/ffi.js";

export class Out {
  private constructor(private readonly pointer: Pointer) {}

  public static createNullReference() {
    const pointer = mainFfi.exports.alloc(1 * 4);
    assert(pointer > 0);
    mainFfi.memoryView.setInt32(pointer, 0, true);

    const instance = new Out(pointer);
    return instance;
  }

  public getReference() {
    const reference = mainFfi.memoryView.getInt32(this.pointer, true);
    return reference;
  }

  public asPointer() {
    return this.pointer;
  }

  [Symbol.dispose]() {
    mainFfi.exports.dealloc(this.pointer, 1 * 4);
  }
}
