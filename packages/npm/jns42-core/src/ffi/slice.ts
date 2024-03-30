import assert from "assert";
import { NULL_POINTER, Pointer, Size } from "../utils/ffi.js";
import { Payload } from "./payload.js";
import { Structure } from "./structure.js";

const SIZE = 2 * 4;

const PAYLOAD_POINTER_OFFSET = 0 * 4;
const PAYLOAD_SIZE_OFFSET = 1 * 4;

export class Slice extends Structure {
  protected get payloadPointer() {
    return this.getUint32(PAYLOAD_POINTER_OFFSET);
  }
  protected set payloadPointer(value: Pointer) {
    this.setUint32(PAYLOAD_POINTER_OFFSET, value);
  }

  protected get payloadSize() {
    return this.getUint32(PAYLOAD_SIZE_OFFSET);
  }
  protected set payloadSize(value: Size) {
    this.setUint32(PAYLOAD_SIZE_OFFSET, value);
  }

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static fromPointer(pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    const instance = new Slice(pointer);
    return instance;
  }

  public static fromBytes(value: Uint8Array) {
    const instance = new Slice(NULL_POINTER);

    const payloadSize = value.length;
    instance.payloadSize = payloadSize;
    if (payloadSize > 0) {
      const payload = new Payload(NULL_POINTER, payloadSize);
      instance.payloadPointer = payload.pointer;
    }
    return instance;
  }

  public toBytes() {
    const payloadSize = this.payloadSize;
    if (payloadSize > 0) {
      const payloadPointer = this.payloadPointer;
      const payload = new Payload(payloadPointer, payloadSize);
      return payload.toBytes();
    } else {
      return new Uint8Array(0);
    }
  }

  [Symbol.dispose]() {
    const payloadSize = this.payloadSize;
    if (payloadSize > 0) {
      const payloadPointer = this.payloadPointer;
      const payload = new Payload(payloadPointer, payloadSize);
      return payload[Symbol.dispose]();
    }

    super[Symbol.dispose]();
  }
}
