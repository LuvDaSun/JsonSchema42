import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "./foreign-object.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class CString extends ForeignObject {
  constructor(pointer: number) {
    super(pointer, () => mainFfi.exports.c_string_drop(pointer));
  }

  public static fromString(value: string) {
    const data = textEncoder.encode(value);
    const pointer = mainFfi.exports.c_string_new(data.length);
    mainFfi.memoryUint8.set(data, pointer);
    return new CString(pointer);
  }

  public toString(): string {
    const { pointer } = this;
    const index = mainFfi.memoryUint8.indexOf(0, pointer);
    if (index < 0) {
      throw new TypeError("cstring size not found");
    }
    const data = mainFfi.memoryUint8.subarray(pointer, index);
    const value = textDecoder.decode(data);
    return value;
  }
}
