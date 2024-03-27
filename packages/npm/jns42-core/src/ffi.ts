import path from "path";
import { FfiExports, FfiWrapper, Pointer, Size } from "./ffi-wrapper.js";
import { projectRoot } from "./root.js";

export interface Exports extends FfiExports {
  alloc(size: Size): Pointer;
  dealloc(pointer: Pointer, size: Size): void;

  reverse(value: Pointer, result: Pointer): void;

  names_builder_new(): Pointer;
  names_builder_add(names_builder: Pointer, key: number, value: Pointer): void;
  names_builder_set_default_name(names_builder: Pointer, value: Pointer): void;
  names_builder_free(names_builder: Pointer): void;
  names_builder_build(names_builder: Pointer): Pointer;
  names_to_camel_case(names: Pointer, key: number): Pointer;
  names_to_pascal_case(names: Pointer, key: number): Pointer;
  names_to_snake_case(names: Pointer, key: number): Pointer;
  names_to_screaming_snake_case(names: Pointer, key: number): Pointer;
  names_free(names: Pointer): void;

  to_camel_case(value: Pointer): Pointer;
  to_pascal_case(value: Pointer): Pointer;
  to_snake_case(value: Pointer): Pointer;
  to_screaming_snake_case(value: Pointer): Pointer;
}

export const ffi = FfiWrapper.fromFile<Exports>(path.join(projectRoot, "bin", "main.wasm"));
