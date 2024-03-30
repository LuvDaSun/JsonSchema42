import assert from "assert";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { SizedString } from "./sized-string.js";
import { Structure } from "./structure.js";

const SIZE = 2 * 4;

const ID_OFFSET = 0 * 4;
const TITLE_OFFSET = 1 * 4;

export class SchemaItem extends Structure {
  private id = SizedString.fromPointer(this.pointer + ID_OFFSET);
  private title = SizedString.fromPointer(this.pointer + TITLE_OFFSET);

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static fromPointer(pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    return new SchemaItem(pointer);
  }

  [Symbol.dispose]() {
    this.id[Symbol.dispose]();
    this.title[Symbol.dispose]();

    super[Symbol.dispose]();
  }
}
