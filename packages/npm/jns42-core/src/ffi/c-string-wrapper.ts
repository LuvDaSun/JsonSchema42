import { assert } from "console";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer, Size } from "../utils/index.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class CStringWrapper {
  public constructor(public readonly pointer: Pointer) {
    //
  }
  public static allocate(value: string | undefined) {
    if (value == null) {
      const pointer = NULL_POINTER;
      return new CStringWrapper(pointer);
    }
    const pointer = allocateCString(value);
    return new CStringWrapper(pointer);
  }
  public read(): string | undefined {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      return;
    }
    return readCString(pointer);
  }
  [Symbol.dispose]() {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      return;
    }
    return deallocateCString(pointer);
  }
}

function allocateCString(value: string): Pointer {
  const data = textEncoder.encode(value);
  const dataSize = data.length;
  const size = dataSize + 1;
  const pointer = mainFfi.exports.alloc(size);
  mainFfi.memoryUint8.set(data, pointer);
  mainFfi.memoryView.setUint8(pointer + size + 0, 0);
  return pointer;
}

function readCString(pointer: Pointer): string {
  assert(pointer !== NULL_POINTER);

  const size = findCStringSize(pointer);
  const dataSize = size - 1;
  const data = mainFfi.memoryUint8.subarray(pointer, pointer + dataSize);
  const value = textDecoder.decode(data);
  return value;
}

function deallocateCString(pointer: Pointer) {
  assert(pointer !== NULL_POINTER);

  const size = findCStringSize(pointer);
  mainFfi.exports.dealloc(pointer, size);
}

function findCStringSize(pointer: Pointer): Size {
  assert(pointer !== NULL_POINTER);

  const index = mainFfi.memoryUint8.indexOf(0, pointer);
  if (index < 0) {
    throw new TypeError("cstring size not found");
  }
  const size = index - pointer;
  return size;
}
