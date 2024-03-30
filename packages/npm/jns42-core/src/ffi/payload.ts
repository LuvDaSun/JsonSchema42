import assert from "assert";
import { NULL_POINTER, Pointer, Size } from "../utils/ffi.js";
import { Structure } from "./structure.js";

export class Payload extends Structure {
  public static fromPointer(pointer: Pointer, size: Size) {
    assert(pointer !== NULL_POINTER);

    const instance = new Payload(pointer, size);
    return instance;
  }

  public static fromBytes(bytes: Uint8Array) {
    const size = bytes.length;
    const instance = new Payload(NULL_POINTER, size);
    return instance;
  }

  public toBytes() {
    return this.getBytes();
  }
}
