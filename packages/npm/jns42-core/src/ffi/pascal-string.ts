import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { Pointer } from "../utils/ffi.js";

export class PascalString {
  private constructor(private readonly pointer: Pointer) {}

  public static fromPointer(pointer: Pointer) {
    const instance = new PascalString(pointer);
    return instance;
  }

  public static fromString(value: string) {
    const metaPointer = mainFfi.exports.alloc(2 * 4);
    assert(metaPointer > 0);

    const dataBytes = mainFfi.textEncoder.encode(value);
    const dataSize = dataBytes.length;
    if (dataSize > 0) {
      const dataPointer = mainFfi.exports.alloc(dataSize);
      assert(dataPointer > 0);
      mainFfi.memoryUint8.set(dataBytes, dataPointer);

      mainFfi.memoryView.setInt32(metaPointer + 0 * 4, dataSize, true);
      mainFfi.memoryView.setInt32(metaPointer + 1 * 4, dataPointer, true);
    } else {
      mainFfi.memoryView.setInt32(metaPointer + 0 * 4, 0, true);
      mainFfi.memoryView.setInt32(metaPointer + 1 * 4, 0, true);
    }

    const instance = new PascalString(metaPointer);
    return instance;
  }

  public toString() {
    const dataSize = mainFfi.memoryView.getInt32(this.pointer + 0 * 4, true);
    const dataPointer = mainFfi.memoryView.getInt32(this.pointer + 1 * 4, true);

    const slice = mainFfi.memoryUint8.slice(dataPointer, dataPointer + dataSize);
    const value = mainFfi.textDecoder.decode(slice, { stream: false });
    return value;
  }

  public asPointer() {
    return this.pointer;
  }

  [Symbol.dispose]() {
    const dataSize = mainFfi.memoryView.getInt32(this.pointer + 0 * 4, true);
    const dataPointer = mainFfi.memoryView.getInt32(this.pointer + 1 * 4, true);
    if (dataSize > 0) {
      mainFfi.exports.dealloc(dataPointer, dataSize);
    }
    mainFfi.exports.dealloc(this.pointer, 2 * 4);
  }
}
