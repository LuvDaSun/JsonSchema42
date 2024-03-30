import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { Structure2 } from "./structure-2.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class CString2 extends Structure2 {
  public get value(): string | undefined {
    if (this.pointer === NULL_POINTER) {
      return undefined;
    } else {
      const bytes = this.getBytes(0, this.size - 1);
      const value = textDecoder.decode(bytes, { stream: false });
      return value;
    }
  }
  public set value(value: string | undefined) {
    if (value == null) {
      this.allocate(0);
    } else {
      const bytes = textEncoder.encode(value);
      const bytesSize = bytes.length;
      this.allocate(bytesSize);
      this.setBytes(bytes);
      this.setUint8(bytesSize + 0, 0);
    }
  }

  public constructor(public pointer: Pointer = NULL_POINTER) {
    if (pointer === NULL_POINTER) {
      super(pointer, 0);
    } else {
      const size = CString2.findSize(pointer);
      super(pointer, size);
    }
  }

  private static findSize(pointer: Pointer) {
    const index = mainFfi.memoryUint8.indexOf(0, pointer);
    if (index < 0) {
      throw new TypeError("cstring size not found");
    }
    const bytesSize = index - pointer;
    const size = bytesSize + 1;
    return size;
  }
}
