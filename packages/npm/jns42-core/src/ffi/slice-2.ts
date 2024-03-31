import { Pointer, Size } from "../utils/ffi.js";
import { Payload2 } from "./payload-2.js";
import { Structure2 } from "./structure-2.js";

export class Slice2 extends Structure2 {
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

  protected payload!: Payload2;

  public constructor(pointer: Pointer) {
    super(pointer, 8);
  }

  protected setup() {
    super.setup();

    this.payload = new Payload2(this.payloadPointer, this.payloadSize);
  }

  protected teardown() {
    this.payload[Symbol.dispose]();

    super.teardown();
  }
}