import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class StringViewWrapper {
  public constructor(public readonly pointer: Pointer) {
    //
  }
  public read(): string | undefined {
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

function read(pointer: Pointer): string {
  assert(pointer !== NULL_POINTER);

  const dataPointer = mainFfi.memoryView.getUint32(pointer + 0, true);
  const dataSize = mainFfi.memoryView.getUint32(pointer + 4, true);
  if (dataSize === 0) {
    const value = "";
    return value;
  } else {
    const data = mainFfi.memoryUint8.subarray(dataPointer, dataPointer + dataSize);
    const value = textDecoder.decode(data);
    return value;
  }
}

function deallocate(pointer: Pointer) {
  assert(pointer !== NULL_POINTER);

  mainFfi.exports.dealloc(pointer, 8);
}
