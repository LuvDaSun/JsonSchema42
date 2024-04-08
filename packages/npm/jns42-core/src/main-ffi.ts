import path from "path";
import { fetchFile } from "./exports/fetch-file.js";
import { MetaSchemaId } from "./imports/meta-schema-id.js";
import { projectRoot } from "./root.js";
import { EnvironmentBase, ExportsBase, Ffi } from "./utils/index.js";

export interface MainEnvironment extends EnvironmentBase {
  host_fetch_file: (location: number, data: number, callback: number) => void;
}

let environment: MainEnvironment = {
  host_fetch_file(locationPointer, dataReferencePointer, callback) {
    mainFfi.spawn_and_callback(callback, () => fetchFile(locationPointer, dataReferencePointer));
  },
};

export interface MainExports extends ExportsBase {
  reference_drop(pointer_box: number): void;
  reference_new(): number;

  c_string_drop(pointer: number): void;
  c_string_new(size: number): number;

  reverse(value: number, result: number, error_reference: number): void;

  names_builder_drop(names_builder: number): void;
  names_builder_new(): number;
  names_builder_add(names_builder: number, key: number, values: number): void;
  names_builder_set_default_name(
    names_builder: number,
    value: number,
    error_reference: number,
  ): void;
  names_builder_build(names_builder: number): number;

  names_drop(names: number): void;
  names_to_camel_case(names: number, key: number, error_reference: number): number;
  names_to_pascal_case(names: number, key: number, error_reference: number): number;
  names_to_snake_case(names: number, key: number, error_reference: number): number;
  names_to_screaming_snake_case(names: number, key: number, error_reference: number): number;

  schema_item_drop(schema_item: number): void;
  schema_item_new(): number;

  schema_arena_drop(schema_arena: number): void;
  schema_arena_clone(schema_arena: number): number;
  schema_arena_new(): number;
  schema_arena_count(schema_arena: number): number;
  schema_arena_add_item(schema_arena: number, item: number, error_reference: number): number;
  schema_arena_replace_item(
    schema_arena: number,
    key: number,
    item: number,
    error_reference: number,
  ): number;
  schema_arena_get_item(schema_arena: number, key: number, error_reference: number): number;
  schema_arena_transform(schema_arena: number, vec: number): number;

  vec_usize_drop(vec_usize: number): void;
  vec_usize_new(capacity: number): number;
  vec_usize_len(vec_usize: number): number;
  vec_usize_push(vec_usize: number, value: number): void;

  vec_string_drop(vec_usize: number): void;
  vec_string_new(capacity: number): number;
  vec_string_len(vec_usize: number): number;
  vec_string_get(vec_usize: number, index: number, error_reference: number): number;
  vec_string_push(vec_usize: number, value: number, error_reference: number): void;

  node_location_drop(node_location: number): void;
  node_location_clone(node_location: number): number;
  node_location_parse(input: number): number;
  node_location_join(node_location: number, other_node_location: number): number;
  node_location_to_string(node_location: number): number;
  node_location_to_fetch_string(node_location: number): number;
  node_location_get_anchor(node_location: number): number;
  node_location_get_pointer(node_location: number): number;
  node_location_get_path(node_location: number): number;
  node_location_get_hash(node_location: number): number;
  node_location_set_anchor(node_location: number, anchor: number): void;
  node_location_set_pointer(node_location: number, pointer: number): void;
  node_location_set_root(node_location: number): void;

  document_context_drop(document_context: number): void;
  document_context_new(): number;
  document_context_register_well_known_factories(
    document_context: number,
    error_reference: number,
  ): void;
  document_context_load_from_location(
    document_context: number,
    retrieval_location: number,
    given_location: number,
    antecedent_location: number,
    default_schema_id: MetaSchemaId,
    error_reference: number,
    callback: number,
  ): void;
  document_context_load_from_node(
    document_context: number,
    retrieval_location: number,
    given_location: number,
    antecedent_location: number,
    node: number,
    default_schema_id: MetaSchemaId,
    error_reference: number,
    callback: number,
  ): void;
  document_context_get_intermediate_document(
    document_context: number,
    error_reference: number,
  ): number;

  to_camel_case(value: number, error_reference: number): number;
  to_pascal_case(value: number, error_reference: number): number;
  to_snake_case(value: number, error_reference: number): number;
  to_screaming_snake_case(value: number, error_reference: number): number;
}

export type MainFfi = Ffi<MainExports, MainEnvironment>;

export const mainFfi: MainFfi = Ffi.fromFile<MainExports, MainEnvironment>(
  path.join(projectRoot, "bin", "main.wasm"),
  environment,
);
