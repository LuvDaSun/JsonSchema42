import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer, Size } from "../utils/index.js";

export abstract class Structure {
  private disposed = false;

  protected constructor(
    public readonly pointer: Pointer,
    protected readonly size: Size,
  ) {
    if (pointer === NULL_POINTER && size > 0) {
      this.pointer = mainFfi.exports.alloc(size);
      assert(this.pointer !== NULL_POINTER);
    }
  }

  public isNull() {
    return this.pointer === NULL_POINTER;
  }

  [Symbol.dispose]() {
    assert(!this.disposed);
    if (this.pointer !== NULL_POINTER && this.size > 0) {
      mainFfi.exports.dealloc(this.pointer, this.size);
    }
    this.disposed = true;
  }
}
