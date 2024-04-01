import { assert } from "console";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer, Size } from "../utils/index.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class CString {
  public constructor(public readonly pointer: Pointer) {
    //
  }
  public static create(value: string) {
    const pointer = createCString(value);
    return new CString(pointer);
  }
  public read(): string {
    const { pointer } = this;
    return readCString(pointer);
  }
  [Symbol.dispose]() {
    const { pointer } = this;
    return freeCString(pointer);
  }
}

export function createCString(value: string): Pointer {
  const data = textEncoder.encode(value);
  const dataSize = data.length;
  const size = dataSize + 1;
  const pointer = mainFfi.exports.alloc(size);
  mainFfi.memoryUint8.set(data, pointer);
  mainFfi.memoryView.setUint8(pointer + size + 0, 0);
  return pointer;
}

export function readCString(pointer: Pointer): string {
  assert(pointer !== NULL_POINTER);

  const size = findCStringSize(pointer);
  const dataSize = size - 1;
  const data = mainFfi.memoryUint8.subarray(pointer, pointer + dataSize);
  const value = textDecoder.decode(data);
  return value;
}

export function freeCString(pointer: Pointer) {
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
  const dataSize = index - pointer;
  const size = dataSize + 1;
  return size;
}
