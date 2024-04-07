import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "./foreign-object.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class CString extends ForeignObject {
  public static fromString(value: string) {
    const pointer = allocate(value);
    return new CString(pointer);
  }
  public toString(): string {
    const { pointer } = this;
    return read(pointer);
  }
  protected drop() {
    const { pointer } = this;
    deallocate(pointer);
  }
}

function allocate(value: string): number {
  const data = textEncoder.encode(value);
  const dataSize = data.length;
  const size = dataSize + 1;
  const pointer = mainFfi.exports.alloc(size);
  mainFfi.memoryUint8.set(data, pointer);
  mainFfi.memoryView.setUint8(pointer + size + 0, 0);
  return pointer;
}

function read(pointer: number): string {
  const size = findCStringSize(pointer);
  const dataSize = size - 1;
  const data = mainFfi.memoryUint8.subarray(pointer, pointer + dataSize);
  const value = textDecoder.decode(data);
  return value;
}

function deallocate(pointer: number) {
  const size = findCStringSize(pointer);
  mainFfi.exports.dealloc(pointer, size);
}

function findCStringSize(pointer: number): number {
  const index = mainFfi.memoryUint8.indexOf(0, pointer);
  if (index < 0) {
    throw new TypeError("cstring size not found");
  }
  const size = index - pointer;
  return size;
}
