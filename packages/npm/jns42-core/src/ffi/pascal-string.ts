import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { Pointer, Size } from "../utils/ffi.js";
import { Structure } from "./structure.js";

const SIZE = 2 * 4;

export class PascalString extends Structure {
  private get dataSize() {
    return mainFfi.memoryView.getInt32(this.pointer + 0 * 4, true);
  }
  private set dataSize(value: Size) {
    mainFfi.memoryView.setInt32(this.pointer + 0 * 4, value, true);
  }

  private get dataPointer() {
    return mainFfi.memoryView.getInt32(this.pointer + 1 * 4, true);
  }
  private set dataPointer(value: Pointer) {
    mainFfi.memoryView.setInt32(this.pointer + 1 * 4, value, true);
  }

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static fromPointer(pointer: Pointer) {
    const instance = new PascalString(pointer);
    return instance;
  }

  public static fromString(value: string) {
    const metaPointer = mainFfi.exports.alloc(SIZE);
    assert(metaPointer > 0);

    const instance = new PascalString(metaPointer);

    const dataBytes = mainFfi.textEncoder.encode(value);
    const dataSize = dataBytes.length;
    if (dataSize > 0) {
      const dataPointer = mainFfi.exports.alloc(dataSize);
      assert(dataPointer > 0);
      mainFfi.memoryUint8.set(dataBytes, dataPointer);

      instance.dataSize = dataSize;
      instance.dataPointer = dataPointer;
    } else {
      instance.dataSize = 0;
      instance.dataPointer = 0;
    }

    return instance;
  }

  public toString() {
    const dataSize = this.dataSize;
    const dataPointer = this.dataPointer;

    const slice = mainFfi.memoryUint8.slice(dataPointer, dataPointer + dataSize);
    const value = mainFfi.textDecoder.decode(slice, { stream: false });
    return value;
  }

  [Symbol.dispose]() {
    const dataSize = this.dataSize;
    const dataPointer = this.dataPointer;
    if (dataSize > 0) {
      mainFfi.exports.dealloc(dataPointer, dataSize);
    }
    super[Symbol.dispose]();
  }
}
