import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { Structure } from "./structure.js";

const SIZE = 1 * 4;

const TARGET_OFFSET = 0 * 4;

export class Output extends Structure {
  public get target() {
    return mainFfi.memoryView.getInt32(this.pointer + TARGET_OFFSET, true);
  }
  private set target(value: Pointer) {
    mainFfi.memoryView.setInt32(this.pointer + TARGET_OFFSET, value, true);
  }

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static createNull() {
    const instance = new Output(NULL_POINTER);
    instance.target = NULL_POINTER;
    return instance;
  }
}
