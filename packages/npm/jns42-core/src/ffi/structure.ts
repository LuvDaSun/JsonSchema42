import { mainFfi } from "../main-ffi.js";
import { Pointer, Size } from "../utils/index.js";

export abstract class Structure {
  protected constructor(
    protected readonly pointer: Pointer,
    protected readonly size: Size,
  ) {
    //
  }

  public asPointer() {
    return this.pointer;
  }

  public isNull() {
    return this.pointer === 0;
  }

  [Symbol.dispose]() {
    mainFfi.exports.dealloc(this.pointer, this.size);
  }
}
