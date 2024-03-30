import assert from "assert";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { Structure } from "./structure.js";

const VALUE_OFFSET = 0;

const SIZE = 1;

export class BooleanStructure extends Structure {
  protected get value() {
    return Boolean(this.getInt8(VALUE_OFFSET));
  }
  protected set value(value: boolean) {
    this.setInt8(VALUE_OFFSET, Number(value));
  }

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static fromPointer(pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    return new BooleanStructure(pointer);
  }

  public static fromValue(value: boolean) {
    const instance = new BooleanStructure(NULL_POINTER);
    instance.value = value;
    return instance;
  }

  public toValue() {
    return this.value;
  }
}
