import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export class Box {
  public constructor(public readonly pointer: number) {
    //
  }
  public static allocate(value: Pointer | undefined) {
    if (value == null) {
      const pointer = NULL_POINTER;
      return new Box(pointer);
    } else {
      const pointer = allocate(value);
      return new Box(pointer);
    }
  }
  public read(): Pointer | undefined {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      return undefined;
    } else {
      return read(pointer);
    }
  }

  [Symbol.dispose]() {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      //
    } else {
      deallocate(pointer);
    }
  }
}

function allocate(value: Pointer): Pointer {
  const pointer = mainFfi.exports.alloc(4);
  mainFfi.memoryView.setUint32(pointer + 0, value, true);
  return pointer;
}

function read(pointer: Pointer): Pointer {
  assert(pointer !== NULL_POINTER);

  const value = mainFfi.memoryView.getUint32(pointer, true);
  return value;
}

function deallocate(pointer: Pointer) {
  assert(pointer !== NULL_POINTER);

  mainFfi.exports.dealloc(pointer, 4);
}
