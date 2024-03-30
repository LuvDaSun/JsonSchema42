import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { Structure } from "./structure.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class CString extends Structure {
  private static findSize(pointer: Pointer) {
    const index = mainFfi.memoryUint8.indexOf(0, pointer);
    if (index < 0) {
      throw new TypeError("cstring size not found");
    }
    const bytesSize = index - pointer;
    const size = bytesSize + 1;
    return size;
  }

  public static fromPointer(pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    const size = CString.findSize(pointer);
    const instance = new CString(pointer, size);
    return instance;
  }

  public static fromValue(value: string) {
    const bytes = textEncoder.encode(value);
    const bytesSize = bytes.length;
    const instance = new CString(NULL_POINTER, bytesSize + 1);
    instance.setBytes(bytes);
    instance.setUint8(bytesSize + 0, 0);
    return instance;
  }

  public toValue() {
    const bytes = this.getBytes();
    const value = textDecoder.decode(bytes, { stream: false });
    return value;
  }
}
