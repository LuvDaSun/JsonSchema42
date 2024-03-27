import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer, Size } from "../utils/index.js";

export abstract class Structure {
  private disposed = false;

  public readonly pointer: Pointer;
  protected readonly size: Size;

  protected constructor(pointer: Pointer, size: Size) {
    this.size = size;
    if (pointer === NULL_POINTER && size > 0) {
      this.pointer = this.allocate();
    } else {
      this.pointer = pointer;
    }
  }

  protected allocate() {
    assert(this.size > 0);
    const pointer = mainFfi.exports.alloc(this.size);
    assert(pointer !== NULL_POINTER);
    return pointer;
  }

  protected deallocate() {
    assert(this.size > 0);
    assert(this.pointer !== NULL_POINTER);
    mainFfi.exports.dealloc(this.pointer, this.size);
  }

  [Symbol.dispose]() {
    assert(!this.disposed);
    if (this.pointer !== NULL_POINTER && this.size > 0) {
      this.deallocate();
    }
    this.disposed = true;
  }
}
