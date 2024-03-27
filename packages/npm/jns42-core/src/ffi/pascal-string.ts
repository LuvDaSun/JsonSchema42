import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer, Size } from "../utils/ffi.js";
import { Structure } from "./structure.js";

const SIZE = 2 * 4;

const DATA_SIZE_OFFSET = 0 * 4;
const DATA_POINTER_OFFSET = 1 * 4;

export class PascalString extends Structure {
  private get dataSize() {
    return mainFfi.memoryView.getInt32(this.pointer + DATA_SIZE_OFFSET, true);
  }
  private set dataSize(value: Size) {
    mainFfi.memoryView.setInt32(this.pointer + DATA_SIZE_OFFSET, value, true);
  }

  private get dataPointer() {
    return mainFfi.memoryView.getInt32(this.pointer + DATA_POINTER_OFFSET, true);
  }
  private set dataPointer(value: Pointer) {
    mainFfi.memoryView.setInt32(this.pointer + DATA_POINTER_OFFSET, value, true);
  }

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static fromPointer(pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    const instance = new PascalString(pointer);
    return instance;
  }

  public static fromString(value: string) {
    const instance = new PascalString(NULL_POINTER);

    const dataBytes = mainFfi.textEncoder.encode(value);
    const dataSize = dataBytes.length;
    instance.dataSize = dataSize;
    if (dataSize > 0) {
      const dataPointer = mainFfi.exports.alloc(dataSize);
      assert(dataPointer !== NULL_POINTER);

      mainFfi.memoryUint8.set(dataBytes, dataPointer);

      instance.dataPointer = dataPointer;
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
