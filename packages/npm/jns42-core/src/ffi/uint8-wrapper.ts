import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export class Uint8Wrapper {
  public constructor(public readonly pointer: number) {
    //
  }
  public static allocate(value: number | undefined) {
    if (value == null) {
      const pointer = NULL_POINTER;
      return new Uint8Wrapper(pointer);
    } else {
      const pointer = allocateUint8(value);
      return new Uint8Wrapper(pointer);
    }
  }
  public read(): number | undefined {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      return undefined;
    } else {
      return readUint8(pointer);
    }
  }
  [Symbol.dispose]() {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      //
    } else {
      deallocateUint8(pointer);
    }
  }
}

function allocateUint8(value: Pointer): Pointer {
  const pointer = mainFfi.exports.alloc(1);
  mainFfi.memoryView.setUint8(pointer + 0, value);
  return pointer;
}

function readUint8(pointer: Pointer): Pointer {
  assert(pointer !== NULL_POINTER);

  const value = mainFfi.memoryView.getUint8(pointer);
  return value;
}

function deallocateUint8(pointer: Pointer) {
  assert(pointer !== NULL_POINTER);

  mainFfi.exports.dealloc(pointer, 1);
}
