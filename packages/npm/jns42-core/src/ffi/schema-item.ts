import { Pointer } from "../utils/ffi.js";
import { SizedString } from "./sized-string.js";
import { Structure } from "./structure.js";

const ID_OFFSET = 0;
const TITLE_OFFSET = 4;
const DEPRECATED_OFFSET = 8;

const SIZE = 9;

export class SchemaItem extends Structure {
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
    return this.getInt32(this.getPointer() + ID_OFFSET);
  }
  protected set idPointer(value: Pointer) {
    this.setInt32(this.getPointer() + ID_OFFSET, value);
  }

  protected get titlePointer() {
    return this.getInt32(this.getPointer() + TITLE_OFFSET);
  }
  protected set titlePointer(value: Pointer) {
    this.setInt32(this.getPointer() + TITLE_OFFSET, value);
  }

  protected get deprecated() {
    return Boolean(this.getInt8(DEPRECATED_OFFSET));
  }
  protected set deprecated(value: boolean) {
    this.setInt8(DEPRECATED_OFFSET, Number(value));
  }

  protected id!: SizedString;
  protected title!: SizedString;

  protected constructor(pointer: Pointer) {
    super(pointer, SIZE);
  }

  protected onAttach() {
    super.onAttach();

    this.id = new SizedString(this.idPointer);
    this.title = new SizedString(this.titlePointer);
  }

  protected onDetach() {
    this.id[Symbol.dispose]();
    this.title[Symbol.dispose]();

    super.onDetach();
  }
}

export interface SchemaItemObject {
  id?: string;
  title?: string;
  deprecated: boolean;
}
