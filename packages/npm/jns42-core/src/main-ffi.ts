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
  reverse(value: number, result: number, error_reference: number): void;

  reference_drop(pointer_box: number): void;
  reference_new(): number;

  c_string_drop(pointer: number): void;
  c_string_new(size: number): number;

  vec_usize_drop(vec_usize: number): void;
  vec_usize_new(capacity: number): number;
  vec_usize_len(vec_usize: number): number;
  vec_usize_push(vec_usize: number, value: number): void;

  vec_string_drop(vec_usize: number): void;
  vec_string_new(capacity: number): number;
  vec_string_len(vec_usize: number): number;
  vec_string_get(vec_usize: number, index: number, error_reference: number): number;
  vec_string_push(vec_usize: number, value: number, error_reference: number): void;

  sentence_drop(sentence: number): void;
  sentence_new(input: number): number;
  sentence_clone(sentence: number): number;
  sentence_join(sentence: number, sentence_other: number): number;

  sentence_to_camel_case(value: number, error_reference: number): number;
  sentence_to_pascal_case(value: number, error_reference: number): number;
  sentence_to_snake_case(value: number, error_reference: number): number;
  sentence_to_screaming_snake_case(value: number, error_reference: number): number;

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
  names_get_name(names: number, key: number): number;

  arena_schema_item_drop(schema_item: number): void;
  arena_schema_item_new(): number;

  schema_arena_drop(schema_arena: number): void;
  schema_arena_new(): number;
  schema_arena_from_document_context(document_context: number): number;
  schema_arena_clone(schema_arena: number): number;
  schema_arena_count(schema_arena: number): number;
  schema_arena_add_item(schema_arena: number, item: number, error_reference: number): number;
  schema_arena_replace_item(
    schema_arena: number,
    key: number,
    item: number,
    error_reference: number,
  ): number;
  schema_arena_get_item(schema_arena: number, key: number, error_reference: number): number;
  schema_arena_get_name_parts(schema_arena: number, key: number): number;
  schema_arena_transform(schema_arena: number, vec: number): number;

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
  document_context_get_schema_nodes(document_context: number, error_reference: number): number;
}

export type MainFfi = Ffi<MainExports, MainEnvironment>;

export const mainFfi: MainFfi = Ffi.fromFile<MainExports, MainEnvironment>(
  path.join(projectRoot, "bin", "main.wasm"),
  environment,
);
