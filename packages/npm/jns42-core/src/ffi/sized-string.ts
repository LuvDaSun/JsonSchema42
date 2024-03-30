import assert from "assert";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { Slice } from "./slice.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class SizedString extends Slice {
  public static fromPointer(pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    const instance = new SizedString(pointer);
    return instance;
  }

  public static fromValue(value: string) {
    const bytes = textEncoder.encode(value);
    const slice = Slice.fromBytes(bytes);

    const instance = SizedString.fromPointer(slice.pointer);
    return instance;
  }

  public toValue() {
    const bytes = this.toBytes();
    const value = textDecoder.decode(bytes, { stream: false });
    return value;
  }
}
