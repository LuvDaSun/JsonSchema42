import assert from "assert";
import * as fs from "fs/promises";
import path from "path";
import { SizedString } from "./foreign/sized-string.js";
import { projectRoot } from "./root.js";
import { EnvironmentBase, ExportsBase, Ffi } from "./utils/index.js";

export interface MainEnvironment extends EnvironmentBase {
  fetch: (location: number, callback: number) => void;
}

let environment: MainEnvironment = {
  fetch(locationPointer, callback) {
    mainFfi.spawn(callback, async () => {
      using locationForeign = new SizedString(locationPointer);
      const location = locationForeign.toString();
      assert(location != null);

      const locationLower = location.toLowerCase();
      let data: string | undefined;
      if (locationLower.startsWith("http://") || locationLower.startsWith("https://")) {
        const result = await fetch(location);
        data = await result.text();
      } else {
        data = await fs.readFile(location, "utf-8");
      }

      using dataForeign = SizedString.fromString(data);
      dataForeign.abandon();

      return dataForeign.pointer;
    });
  },
};

export interface MainExports extends ExportsBase {
  alloc(size: number): number;
  realloc(pointer: number, size_old: number, size: number): number;
  dealloc(pointer: number, size: number): void;

  reverse(value: number, result: number): void;

  names_builder_drop(names_builder: number): void;
  names_builder_new(): number;
  names_builder_add(names_builder: number, key: number, values: number): void;
  names_builder_set_default_name(names_builder: number, value: number): void;
  names_builder_build(names_builder: number): number;

  names_drop(names: number): void;
  names_to_camel_case(names: number, key: number): number;
  names_to_pascal_case(names: number, key: number): number;
  names_to_snake_case(names: number, key: number): number;
  names_to_screaming_snake_case(names: number, key: number): number;

  schema_item_drop(schema_item: number): void;
  schema_item_new(): number;

  schema_arena_drop(schema_arena: number): void;
  schema_arena_clone(schema_arena: number): number;
  schema_arena_new(): number;
  schema_arena_count(schema_arena: number): number;
  schema_arena_add_item(schema_arena: number, item: number): number;
  schema_arena_replace_item(schema_arena: number, key: number, item: number): number;
  schema_arena_get_item(schema_arena: number, key: number): number;
  schema_arena_transform(schema_arena: number, vec: number): number;

  vec_usize_drop(vec_usize: number): void;
  vec_usize_new(capacity: number): number;
  vec_usize_len(vec_usize: number): number;
  vec_usize_push(vec_usize: number, value: number): void;

  vec_sized_string_drop(vec_usize: number): void;
  vec_sized_string_new(capacity: number): number;
  vec_sized_string_len(vec_usize: number): number;
  vec_sized_string_get(vec_usize: number, index: number): number;
  vec_sized_string_push(vec_usize: number, value: number): void;

  node_location_drop(node_location: number): void;
  node_location_clone(node_location: number): number;
  node_location_parse(input: number): number;
  node_location_join(node_location: number, other_node_location: number): number;
  node_location_to_string(node_location: number): number;
  node_location_to_retrieval_string(node_location: number): number;
  node_location_get_anchor(node_location: number): number;
  node_location_get_pointer(node_location: number): number;
  node_location_get_path(node_location: number): number;
  node_location_get_hash(node_location: number): number;
  node_location_set_anchor(node_location: number, anchor: number): void;
  node_location_set_pointer(node_location: number, pointer: number): void;
  node_location_set_root(node_location: number): void;

  document_context_drop(document_context: number): void;
  document_context_new(): number;
  document_context_load(document_context: number, location: number, key: number): void;

  to_camel_case(value: number): number;
  to_pascal_case(value: number): number;
  to_snake_case(value: number): number;
  to_screaming_snake_case(value: number): number;
}

export type MainFfi = Ffi<MainExports, MainEnvironment>;

export const mainFfi: MainFfi = Ffi.fromFile<MainExports, MainEnvironment>(
  path.join(projectRoot, "bin", "main.wasm"),
  environment,
);
