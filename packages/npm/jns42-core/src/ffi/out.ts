import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { Pointer } from "../utils/ffi.js";
import { Structure } from "./structure.js";

const SIZE = 1 * 4;

export class Out extends Structure {
  public get reference() {
    return mainFfi.memoryView.getInt32(this.pointer + 0 * 4, true);
  }
  private set reference(value: Pointer) {
    mainFfi.memoryView.setInt32(this.pointer + 0 * 4, value, true);
  }

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static createNull() {
    const pointer = mainFfi.exports.alloc(SIZE);
    assert(pointer > 0);

    const instance = new Out(pointer);

    instance.reference = 0;

    return instance;
  }
}
