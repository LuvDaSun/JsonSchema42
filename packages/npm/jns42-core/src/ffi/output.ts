import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { Structure } from "./structure.js";

export class Output extends Structure {
  public get targetPointer() {
    return this.getInt32(0);
  }
  private set targetPointer(value: Pointer) {
    this.setInt32(0, value);
  }

  public constructor(pointer: Pointer = NULL_POINTER) {
    super(pointer, 4);
  }
}
