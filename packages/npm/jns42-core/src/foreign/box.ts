import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";
import { ForeignObject } from "./wrapper.js";

export class Box extends ForeignObject {
  public static allocate(value: Pointer | undefined) {
    if (value == null) {
      const pointer = NULL_POINTER;
      return new Box(pointer);
    } else {
      const pointer = mainFfi.exports.alloc(4);
      mainFfi.memoryView.setUint32(pointer + 0, value, true);
      return new Box(pointer);
    }
  }
  public read(): Pointer | undefined {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      return undefined;
    } else {
      const value = mainFfi.memoryView.getUint32(pointer, true);
      return value;
    }
  }

  protected drop() {
    const { pointer } = this;
    mainFfi.exports.dealloc(pointer, 4);
  }
}
