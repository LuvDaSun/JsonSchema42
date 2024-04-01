import { mainFfi } from "../main-ffi.js";
import { Pointer } from "../utils/index.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class SizedString {
  public constructor(public readonly pointer: Pointer) {
    //
  }
  public static create(value: string) {
    const pointer = createSizedString(value);
    return new SizedString(pointer);
  }
  public read(): string {
    const { pointer } = this;
    return readSizedString(pointer);
  }
  [Symbol.dispose]() {
    const { pointer } = this;
    return freeSizedString(pointer);
  }
}

export function createSizedString(value: string): Pointer {
  const data = textEncoder.encode(value);
  const dataSize = data.length;
  const dataPointer = mainFfi.exports.alloc(dataSize);
  const pointer = mainFfi.exports.alloc(8);
  mainFfi.memoryUint8.set(data, dataPointer);
  mainFfi.memoryView.setUint32(pointer + 0, dataPointer, true);
  mainFfi.memoryView.setUint32(pointer + 4, dataSize, true);
  return pointer;
}

export function readSizedString(pointer: Pointer): string {
  const dataPointer = mainFfi.memoryView.getUint32(pointer + 0, true);
  const dataSize = mainFfi.memoryView.getUint32(pointer + 4, true);
  const data = mainFfi.memoryUint8.subarray(dataPointer, dataPointer + dataSize);
  const value = textDecoder.decode(data);
  return value;
}

export function freeSizedString(pointer: Pointer) {
  const dataPointer = mainFfi.memoryView.getUint32(pointer + 0, true);
  const dataSize = mainFfi.memoryView.getUint32(pointer + 4, true);
  mainFfi.exports.dealloc(dataPointer, dataSize);
  mainFfi.exports.dealloc(pointer, 8);
}
