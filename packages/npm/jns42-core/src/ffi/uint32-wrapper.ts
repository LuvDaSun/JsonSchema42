import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export class Uint32Wrapper {
  public constructor(public readonly pointer: number) {
    //
  }
  public static allocate(value: number | undefined) {
    if (value == null) {
      const pointer = NULL_POINTER;
      return new Uint32Wrapper(pointer);
    } else {
      const pointer = allocateUint32(value);
      return new Uint32Wrapper(pointer);
    }
  }
  public read(): number | undefined {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      return undefined;
    } else {
      return readUint32(pointer);
    }
  }
  [Symbol.dispose]() {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      //
    } else {
      deallocateUint32(pointer);
    }
  }
}

function allocateUint32(value: Pointer): Pointer {
  const pointer = mainFfi.exports.alloc(4);
  mainFfi.memoryView.setUint32(pointer + 0, value);
  return pointer;
}

function readUint32(pointer: Pointer): Pointer {
  assert(pointer !== NULL_POINTER);

  const value = mainFfi.memoryView.getUint32(pointer);
  return value;
}

function deallocateUint32(pointer: Pointer) {
  assert(pointer !== NULL_POINTER);

  mainFfi.exports.dealloc(pointer, 4);
}
