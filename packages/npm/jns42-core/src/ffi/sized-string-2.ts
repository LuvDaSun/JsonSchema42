import { NULL_POINTER } from "../utils/ffi.js";
import { Slice2 } from "./slice-2.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class SizedString2 extends Slice2 {
  public get value(): string | undefined {
    if (this.getPointer() === NULL_POINTER) {
      return undefined;
    } else {
      const bytes = this.payload!.value;
      const value = textDecoder.decode(bytes, { stream: false });
      return value;
    }
  }
  public set value(value: string | undefined) {
    if (value == null) {
      this.setSize(0);
    } else {
      this.setSize(8);
      const bytes = textEncoder.encode(value);
      this.payload!.value = bytes;
    }
  }
}
