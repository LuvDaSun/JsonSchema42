import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";
import { ForeignObject } from "./foreign-object.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class SizedString extends ForeignObject {
  public static fromString(value: string | undefined) {
    if (value == null) {
      const pointer = NULL_POINTER;
      return new SizedString(pointer);
    } else {
      const pointer = allocate(value);
      return new SizedString(pointer);
    }
  }
  public toString(): string | undefined {
    const { pointer } = this;
    if (pointer === NULL_POINTER) {
      return undefined;
    } else {
      return read(pointer);
    }
  }
  protected drop() {
    const { pointer } = this;
    deallocate(pointer);
  }
}

function allocate(value: string): Pointer {
  const pointer = mainFfi.exports.alloc(8);
  const data = textEncoder.encode(value);
  const dataSize = data.length;
  if (dataSize === 0) {
    mainFfi.memoryView.setUint32(pointer + 0, NULL_POINTER, true);
  } else {
    const dataPointer = mainFfi.exports.alloc(dataSize);
    mainFfi.memoryUint8.set(data, dataPointer);
    mainFfi.memoryView.setUint32(pointer + 0, dataPointer, true);
  }
  mainFfi.memoryView.setUint32(pointer + 4, dataSize, true);
  return pointer;
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

  const dataPointer = mainFfi.memoryView.getUint32(pointer + 0, true);
  const dataSize = mainFfi.memoryView.getUint32(pointer + 4, true);
  mainFfi.exports.dealloc(pointer, 8);
  if (dataSize === 0) {
    //
  } else {
    mainFfi.exports.dealloc(dataPointer, dataSize);
  }
}
