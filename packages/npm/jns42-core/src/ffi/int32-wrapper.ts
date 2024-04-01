import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export class Int32Wrapper {
  public constructor(public readonly pointer: number) {
    //
  }
  public static allocate(value: number | undefined) {
    if (value == null) {
      const pointer = NULL_POINTER;
      return new Int32Wrapper(pointer);
    } else {
      const pointer = allocateInt32(value);
      return new Int32Wrapper(pointer);
    }
  }
  public read(): number | undefined {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      return undefined;
    } else {
      return readInt32(pointer);
    }
  }
  [Symbol.dispose]() {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      //
    } else {
      deallocateInt32(pointer);
    }
  }
}

function allocateInt32(value: Pointer): Pointer {
  const pointer = mainFfi.exports.alloc(4);
  mainFfi.memoryView.setInt32(pointer + 0, value);
  return pointer;
}

function readInt32(pointer: Pointer): Pointer {
  assert(pointer !== NULL_POINTER);

  const value = mainFfi.memoryView.getInt32(pointer);
  return value;
}

function deallocateInt32(pointer: Pointer) {
  assert(pointer !== NULL_POINTER);

  mainFfi.exports.dealloc(pointer, 4);
}
