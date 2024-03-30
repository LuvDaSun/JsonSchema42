import { Payload2 } from "./payload-2.js";
import { Slice2 } from "./slice-2.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

export class SizedString2 extends Slice2 {
  protected get value(): string | undefined {
    if (this.payload == null) {
      return undefined;
    } else {
      const bytes = this.payload.value;
      const value = textDecoder.decode(bytes);
      return value;
    }
  }
  protected set value(value: string | undefined) {
    if (value == null) {
      this.payload = undefined;
    } else {
      const bytes = textEncoder.encode(value);
      this.payload = new Payload2();
      this.payload.value = bytes;
    }
  }
}
