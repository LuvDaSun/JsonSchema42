import assert from "assert";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { SizedString } from "./sized-string.js";
import { Structure } from "./structure.js";

const ID_OFFSET = 0;
const TITLE_OFFSET = 4;
const DEPRECATED_OFFSET = 8;

const SIZE = 9;

export class SchemaItem extends Structure {
  protected get id() {
    const pointer = this.getInt32(this.pointer + ID_OFFSET);
    if (pointer === NULL_POINTER) {
      return undefined;
    } else {
      return SizedString.fromPointer(pointer);
    }
  }
  protected set id(value: SizedString | undefined) {
    if (value == null) {
      this.setInt32(this.pointer + ID_OFFSET, NULL_POINTER);
    } else {
      this.setInt32(this.pointer + ID_OFFSET, value.pointer);
    }
  }

  protected get title() {
    const pointer = this.getInt32(this.pointer + TITLE_OFFSET);
    if (pointer === NULL_POINTER) {
      return undefined;
    } else {
      return SizedString.fromPointer(pointer);
    }
  }
  protected set title(value: SizedString | undefined) {
    if (value == null) {
      this.setInt32(this.pointer + TITLE_OFFSET, NULL_POINTER);
    } else {
      this.setInt32(this.pointer + TITLE_OFFSET, value.pointer);
    }
  }

  protected get deprecated() {
    return Boolean(this.getInt8(DEPRECATED_OFFSET));
  }
  protected set deprecated(value: boolean) {
    this.setInt8(DEPRECATED_OFFSET, Number(value));
  }

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  public static fromPointer(pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    return new SchemaItem(pointer);
  }

  public static fromObject(object: SchemaItemObject) {
    const instance = new SchemaItem(NULL_POINTER);

    instance.id = object.id == null ? undefined : SizedString.fromString(object.id);
    instance.title = object.title == null ? undefined : SizedString.fromString(object.title);

    return instance;
  }

  public toObject() {
    return {
      id: this.id?.toString(),
      title: this.title?.toString(),
      deprecated: this.deprecated,
    };
  }

  [Symbol.dispose]() {
    this.id?.[Symbol.dispose]();
    this.title?.[Symbol.dispose]();

    super[Symbol.dispose]();
  }
}

export interface SchemaItemObject {
  id?: string;
  title?: string;
  deprecated?: boolean;
}
