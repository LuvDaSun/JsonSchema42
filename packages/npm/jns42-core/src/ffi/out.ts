import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { Structure } from "./structure.js";

const SIZE = 1 * 4;

const REFERENCE_OFFSET = 0 * 4;

export class Out extends Structure {
  public get reference() {
    return mainFfi.memoryView.getInt32(this.pointer + REFERENCE_OFFSET, true);
  }
  private set reference(value: Pointer) {
    mainFfi.memoryView.setInt32(this.pointer + REFERENCE_OFFSET, value, true);
  }

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static createNull() {
    const instance = new Out(NULL_POINTER);

    instance.reference = NULL_POINTER;

    return instance;
  }
}
