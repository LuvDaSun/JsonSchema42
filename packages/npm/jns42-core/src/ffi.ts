import fs from "node:fs";
import path from "path";
import { projectRoot } from "./root.js";

export type Size = number;
export type Pointer = number;

const wasmBytes = fs.readFileSync(path.join(projectRoot, "bin", "main.wasm"));
const wasmModule = new WebAssembly.Module(wasmBytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, {});
export const exports = wasmInstance.exports as unknown as WasmExports;

export const textEncoder = new TextEncoder();
export const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

let memoryUint8Cache: Uint8Array;
export function getMemoryUint8() {
  // if not defined or detached. For some reason (if the memory grows?) the array automatically detaches.
  if (memoryUint8Cache == null || memoryUint8Cache.buffer.byteLength === 0) {
    memoryUint8Cache = new Uint8Array(exports.memory.buffer);
  }
  return memoryUint8Cache;
}

let memoryViewCache: DataView;
export function getMemoryView() {
  // if not defined or detached. For some reason the view automatically detaches
  if (memoryViewCache == null || memoryViewCache.buffer.byteLength === 0) {
    memoryViewCache = new DataView(exports.memory.buffer);
  }
  return memoryViewCache;
}

interface WasmExports {
  memory: WebAssembly.Memory;
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
