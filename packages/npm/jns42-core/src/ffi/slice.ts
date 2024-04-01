import { NULL_POINTER, Pointer, Size } from "../utils/ffi.js";
import { Payload } from "./payload.js";
import { Structure } from "./structure.js";

export class Slice extends Structure {
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

  protected payload?: Payload;

  public constructor(pointer: Pointer = NULL_POINTER) {
    super(pointer, 8);
  }

  protected onAttach() {
    super.onAttach();

    this.payload = new Payload(this.payloadPointer, this.payloadSize);
  }

  protected onDetach() {
    this.payload![Symbol.dispose]();
    this.payload = undefined;

    super.onDetach();
  }
}
