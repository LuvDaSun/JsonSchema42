import path from "path";
import { projectRoot } from "./root.js";
import { Exports, Ffi, Pointer, Size } from "./utils/index.js";

export interface MainExports extends Exports {
  alloc(size: Size): Pointer;
  realloc(pointer: Pointer, size_old: Size, size: Size): Pointer;
  dealloc(pointer: Pointer, size: Size): void;

  reverse(value: Pointer, result: Pointer): void;

  names_builder_drop(names_builder: Pointer): void;
  names_builder_new(): Pointer;
  names_builder_add(names_builder: Pointer, key: number, values: Pointer): void;
  names_builder_set_default_name(names_builder: Pointer, value: Pointer): void;
  names_builder_build(names_builder: Pointer): Pointer;

  names_drop(names: Pointer): void;
  names_to_camel_case(names: Pointer, key: number): Pointer;
  names_to_pascal_case(names: Pointer, key: number): Pointer;
  names_to_snake_case(names: Pointer, key: number): Pointer;
  names_to_screaming_snake_case(names: Pointer, key: number): Pointer;

  schema_item_drop(schema_item: Pointer): void;
  schema_item_new(): Pointer;

  schema_arena_drop(schema_arena: Pointer): void;
  schema_arena_clone(schema_arena: Pointer): Pointer;
  schema_arena_new(): Pointer;
  schema_arena_count(schema_arena: Pointer): number;
  schema_arena_add_item(schema_arena: Pointer, item: Pointer): number;
  schema_arena_replace_item(schema_arena: Pointer, key: number, item: Pointer): Pointer;
  schema_arena_get_item(schema_arena: Pointer, key: number): Pointer;
  schema_arena_transform(schema_arena: Pointer, vec: Pointer): number;

  vec_usize_drop(vec_usize: Pointer): void;
  vec_usize_new(capacity: number): Pointer;
  vec_usize_len(vec_usize: Pointer): number;
  vec_usize_push(vec_usize: Pointer, value: number): void;

  vec_sized_string_drop(vec_usize: Pointer): void;
  vec_sized_string_new(capacity: number): Pointer;
  vec_sized_string_len(vec_usize: Pointer): number;
  vec_sized_string_get(vec_usize: Pointer, index: number): Pointer;
  vec_sized_string_push(vec_usize: Pointer, value: Pointer): void;

  node_location_drop(node_location: Pointer): void;
  node_location_clone(node_location: Pointer): Pointer;
  node_location_parse(input: Pointer): Pointer;
  node_location_join(node_location: Pointer, other_node_location: Pointer): Pointer;
  node_location_to_string(node_location: Pointer): Pointer;
  node_location_to_retrieval_string(node_location: Pointer): Pointer;
  node_location_get_anchor(node_location: Pointer): Pointer;
  node_location_get_pointer(node_location: Pointer): Pointer;
  node_location_get_path(node_location: Pointer): Pointer;
  node_location_get_hash(node_location: Pointer): Pointer;
  node_location_set_anchor(node_location: Pointer, anchor: Pointer): void;
  node_location_set_pointer(node_location: Pointer, pointer: Pointer): void;
  node_location_set_root(node_location: Pointer): void;

  document_context_drop(document_context: Pointer): void;
  document_context_new(): Pointer;

  to_camel_case(value: Pointer): Pointer;
  to_pascal_case(value: Pointer): Pointer;
  to_snake_case(value: Pointer): Pointer;
  to_screaming_snake_case(value: Pointer): Pointer;
}

export type MainFfi = Ffi<MainExports>;

export const mainFfi: MainFfi = Ffi.fromFile<MainExports>(
  path.join(projectRoot, "bin", "main.wasm"),
);
