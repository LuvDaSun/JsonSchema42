import assert from "assert";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { Slice } from "./slice.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class Utf8String extends Slice {
  public static fromPointer(pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    const instance = new Utf8String(pointer);
    return instance;
  }

  public static fromString(value: string) {
    const bytes = textEncoder.encode(value);
    const slice = Slice.fromBytes(bytes);

    const instance = Utf8String.fromPointer(slice.pointer);
    return instance;
  }

  public toString() {
    const bytes = this.toBytes();
    const value = textDecoder.decode(bytes, { stream: false });
    return value;
  }
}
