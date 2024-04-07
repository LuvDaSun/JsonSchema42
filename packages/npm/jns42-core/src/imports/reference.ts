import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "../utils/foreign-object.js";

export class Reference extends ForeignObject {
  constructor(pointer: number) {
    super(pointer, () => mainFfi.exports.reference_drop(pointer));
  }

  public static fromTargetPointer(value: number) {
    const pointer = mainFfi.exports.reference_new();
    mainFfi.memoryView.setUint32(pointer, value, true);
    return new Reference(pointer);
  }

  public toTargetPointer(): number {
    const { pointer } = this;
    const value = mainFfi.memoryView.getUint32(pointer, true);
    return value;
  }

  public setTargetPointer(value: number) {
    const { pointer } = this;
    mainFfi.memoryView.setUint32(pointer, value, true);
  }
}
