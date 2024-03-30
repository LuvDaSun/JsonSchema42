import { NULL_POINTER, Pointer, Size } from "../utils/ffi.js";
import { Payload2 } from "./payload-2.js";
import { Structure } from "./structure.js";

export class Slice2 extends Structure {
  protected get payload(): Payload2 | undefined {
    if (this.payloadPointer === NULL_POINTER) {
      return undefined;
    } else {
      return new Payload2(this.payloadPointer, this.payloadSize);
    }
  }
  protected set payload(value: Payload2 | undefined) {
    const valueOld = this.payload;
    if (valueOld == null) {
      // ok
    } else {
      valueOld[Symbol.dispose]();
    }

    if (value == null) {
      this.payloadPointer = NULL_POINTER;
      this.payloadSize = 0;
    } else {
      this.payloadPointer = value.pointer;
      this.payloadSize = value.size;
    }
  }

  protected get payloadPointer() {
    return this.getUint32(0);
  }
  protected set payloadPointer(value: Pointer) {
    this.setUint32(0, value);
  }

  protected get payloadSize() {
    return this.getUint32(4);
  }
  protected set payloadSize(value: Size) {
    this.setUint32(4, value);
  }

  protected constructor(pointer: Pointer) {
    super(pointer, 8);
  }

  [Symbol.dispose]() {
    this.payload?.[Symbol.dispose]();

    super[Symbol.dispose]();
  }
}
