import path from "path";
import { projectRoot } from "./root.js";
import { Exports, Ffi, Pointer, Size } from "./utils/index.js";

export interface MainExports extends Exports {
  alloc(size: Size): Pointer;
  realloc(pointer: Pointer, size_old: Size, size: Size): Pointer;
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

export type MainFfi = Ffi<MainExports>;

export const mainFfi: MainFfi = Ffi.fromFile<MainExports>(
  path.join(projectRoot, "bin", "main.wasm"),
);