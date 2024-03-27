import assert from "assert";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { PascalString } from "./pascal-string.js";
import { Structure } from "./structure.js";

const SIZE = 2 * 4;

export class SchemaItem extends Structure {
  private id = PascalString.fromPointer(this.pointer + 0 * 4);
  private name = PascalString.fromPointer(this.pointer + 1 * 4);

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static fromPointer(pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    return new SchemaItem(pointer);
  }

  [Symbol.dispose]() {
    this.id[Symbol.dispose]();
    this.name[Symbol.dispose]();

    super[Symbol.dispose]();
  }
}
