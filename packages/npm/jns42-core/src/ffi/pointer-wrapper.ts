import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export class PointerWrapper {
  public constructor(public readonly pointer: number) {
    //
  }
  public static allocate(value: Pointer) {
    const pointer = allocateOutput(value);
    return new PointerWrapper(pointer);
  }
  public read(): Pointer {
    const { pointer } = this;
    return readOutput(pointer);
  }
  [Symbol.dispose]() {
    const { pointer } = this;
    return deallocateOutput(pointer);
  }
}

function allocateOutput(value: Pointer): Pointer {
  const pointer = mainFfi.exports.alloc(4);
  mainFfi.memoryView.setUint32(pointer + 0, value, true);
  return pointer;
}

function readOutput(pointer: Pointer): Pointer {
  assert(pointer !== NULL_POINTER);

  const value = mainFfi.memoryView.getUint32(pointer);
  return value;
}

function deallocateOutput(pointer: Pointer) {
  assert(pointer !== NULL_POINTER);

  mainFfi.exports.dealloc(pointer, 4);
}
