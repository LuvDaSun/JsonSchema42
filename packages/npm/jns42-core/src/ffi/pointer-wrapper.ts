import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export class PointerWrapper {
  public constructor(public readonly pointer: number) {
    //
  }
  public static allocate(value: Pointer | undefined) {
    if (value == null) {
      const pointer = NULL_POINTER;
      return new PointerWrapper(pointer);
    } else {
      const pointer = allocatePointer(value);
      return new PointerWrapper(pointer);
    }
  }
  public read(): Pointer | undefined {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      return undefined;
    } else {
      return readPointer(pointer);
    }
  }
  [Symbol.dispose]() {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      //
    } else {
      deallocatePointer(pointer);
    }
  }
}

function allocatePointer(value: Pointer): Pointer {
  const pointer = mainFfi.exports.alloc(4);
  mainFfi.memoryView.setUint32(pointer + 0, value, true);
  return pointer;
}

function readPointer(pointer: Pointer): Pointer {
  assert(pointer !== NULL_POINTER);

  const value = mainFfi.memoryView.getUint32(pointer);
  return value;
}

function deallocatePointer(pointer: Pointer) {
  assert(pointer !== NULL_POINTER);

  mainFfi.exports.dealloc(pointer, 4);
}
