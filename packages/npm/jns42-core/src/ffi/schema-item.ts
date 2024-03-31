import { Pointer } from "../utils/ffi.js";
import { SizedString2 } from "./sized-string-2.js";
import { Structure2 } from "./structure-2.js";

const ID_OFFSET = 0;
const TITLE_OFFSET = 4;
const DEPRECATED_OFFSET = 8;

const SIZE = 9;

export class SchemaItem extends Structure2 {
  public get value(): SchemaItemObject {
    return {
      id: this.id.value,
      title: this.title.value,
      deprecated: this.deprecated,
    };
  }
  public set value(value: SchemaItemObject) {
    this.id.value = value.id;
    this.title.value = value.title;
    this.deprecated = value.deprecated;
  }

  protected get idPointer() {
    return this.getInt32(this.pointer + ID_OFFSET);
  }
  protected set idPointer(value: Pointer) {
    this.setInt32(this.pointer + ID_OFFSET, value);
  }

  protected get titlePointer() {
    return this.getInt32(this.pointer + TITLE_OFFSET);
  }
  protected set titlePointer(value: Pointer) {
    this.setInt32(this.pointer + TITLE_OFFSET, value);
  }

  protected get deprecated() {
    return Boolean(this.getInt8(DEPRECATED_OFFSET));
  }
  protected set deprecated(value: boolean) {
    this.setInt8(DEPRECATED_OFFSET, Number(value));
  }

  protected id!: SizedString2;
  protected title!: SizedString2;

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  protected setup() {
    super.setup();

    this.id = new SizedString2(this.idPointer);
    this.title = new SizedString2(this.titlePointer);
  }

  protected teardown() {
    this.id[Symbol.dispose]();
    this.title[Symbol.dispose]();

    super.teardown();
  }
}

export interface SchemaItemObject {
  id?: string;
  title?: string;
  deprecated: boolean;
}
