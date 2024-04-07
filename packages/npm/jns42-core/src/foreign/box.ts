import { mainFfi } from "../main-ffi.js";
import { Pointer } from "../utils/index.js";
import { ForeignObject } from "./foreign-object.js";

export class Box extends ForeignObject {
  public static fromTargetPointer(value: Pointer) {
    const pointer = mainFfi.exports.alloc(4);
    mainFfi.memoryView.setUint32(pointer + 0, value, true);
    return new Box(pointer);
  }
  public toTargetPointer(): Pointer {
    const { pointer } = this;
    const value = mainFfi.memoryView.getUint32(pointer, true);
    return value;
  }
  public setTargetPointer(value: Pointer) {
    const { pointer } = this;
    mainFfi.memoryView.setUint32(pointer, value, true);
  }

  protected drop() {
    const { pointer } = this;
    mainFfi.exports.dealloc(pointer, 4);
  }
}
