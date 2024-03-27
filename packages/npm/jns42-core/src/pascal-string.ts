import assert from "assert";
import { ffi, Pointer } from "./ffi.js";

export class PascalString {
  private constructor(private readonly pointer: Pointer) {}

  public static fromPointer(pointer: Pointer) {
    const instance = new PascalString(pointer);
    return instance;
  }

  public static fromString(value: string) {
    const metaPointer = ffi.exports.alloc(2 * 4);
    assert(metaPointer > 0);

    const dataBytes = ffi.textEncoder.encode(value);
    const dataSize = dataBytes.length;
    if (dataSize > 0) {
      const dataPointer = ffi.exports.alloc(dataSize);
      assert(dataPointer > 0);
      ffi.memoryUint8.set(dataBytes, dataPointer);

      ffi.memoryView.setInt32(metaPointer + 0 * 4, dataSize, true);
      ffi.memoryView.setInt32(metaPointer + 1 * 4, dataPointer, true);
    } else {
      ffi.memoryView.setInt32(metaPointer + 0 * 4, 0, true);
      ffi.memoryView.setInt32(metaPointer + 1 * 4, 0, true);
    }

    const instance = new PascalString(metaPointer);
    return instance;
  }

  public toString() {
    const dataSize = ffi.memoryView.getInt32(this.pointer + 0 * 4, true);
    const dataPointer = ffi.memoryView.getInt32(this.pointer + 1 * 4, true);

    const slice = ffi.memoryUint8.slice(dataPointer, dataPointer + dataSize);
    const value = ffi.textDecoder.decode(slice, { stream: false });
    return value;
  }

  public asPointer() {
    return this.pointer;
  }

  [Symbol.dispose]() {
    const dataSize = ffi.memoryView.getInt32(this.pointer + 0 * 4, true);
    const dataPointer = ffi.memoryView.getInt32(this.pointer + 1 * 4, true);
    if (dataSize > 0) {
      ffi.exports.dealloc(dataPointer, dataSize);
    }
    ffi.exports.dealloc(this.pointer, 2 * 4);
  }
}
