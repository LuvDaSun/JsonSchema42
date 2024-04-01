import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export class Output {
  public constructor(public readonly pointer: number) {
    //
  }
  public static allocate(value: number) {
    const pointer = allocateOutput(value);
    return new Output(pointer);
  }
  public read(): number {
    const { pointer } = this;
    return readOutput(pointer);
  }
  [Symbol.dispose]() {
    const { pointer } = this;
    return freeOutput(pointer);
  }
}

export function allocateOutput(value: Pointer): Pointer {
  const pointer = mainFfi.exports.alloc(4);
  mainFfi.memoryView.setUint32(pointer + 0, value, true);
  return pointer;
}

export function readOutput(pointer: Pointer): Pointer {
  assert(pointer !== NULL_POINTER);

  const value = mainFfi.memoryView.getUint32(pointer);
  return value;
}

export function freeOutput(pointer: Pointer) {
  assert(pointer !== NULL_POINTER);

  mainFfi.exports.dealloc(pointer, 4);
}
