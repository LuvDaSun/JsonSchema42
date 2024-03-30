import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { Structure } from "./structure.js";

const SIZE = 4;

const TARGET_OFFSET = 0;

export class Output extends Structure {
  public get targetPointer() {
    return mainFfi.memoryView.getInt32(this.pointer + TARGET_OFFSET, true);
  }
  private set targetPointer(value: Pointer) {
    mainFfi.memoryView.setInt32(this.pointer + TARGET_OFFSET, value, true);
  }

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static createNull() {
    const instance = new Output(NULL_POINTER);
    instance.targetPointer = NULL_POINTER;
    return instance;
  }
}
