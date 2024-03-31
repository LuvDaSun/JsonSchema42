import { Slice2 } from "./slice-2.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class SizedString2 extends Slice2 {
  protected get value(): string {
    const bytes = this.payload.value;
    const value = textDecoder.decode(bytes);
    return value;
  }
  protected set value(value: string) {
    const bytes = textEncoder.encode(value);
    this.payload.value = bytes;
  }
}
