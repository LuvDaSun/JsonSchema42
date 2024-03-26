import assert from "assert";
import fs from "node:fs";
import path from "path";
import { projectRoot } from "./root.js";

//#region wasm

export type Size = number;
export type Pointer = number;

const wasmBytes = fs.readFileSync(path.join(projectRoot, "bin", "main.wasm"));
const wasmModule = new WebAssembly.Module(wasmBytes);
const wasmInstance = new WebAssembly.Instance(wasmModule, {});
export const wasmExports = wasmInstance.exports as unknown as WasmExports;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

let memoryUint8Cache: Uint8Array;
function getMemoryUint8() {
  // if not defined or detached. For some reason the array automatically detaches.
  if (memoryUint8Cache == null || memoryUint8Cache.byteLength === 0) {
    memoryUint8Cache = new Uint8Array(wasmExports.memory.buffer);
  }
  return memoryUint8Cache;
}

let memoryViewCache: DataView;
function getMemoryView() {
  // if not defined or detached. For some reason the view automatically detaches
  if (memoryViewCache == null || memoryViewCache.byteLength === 0) {
    memoryViewCache = new DataView(wasmExports.memory.buffer);
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
  names_builder_free(names_builder: Pointer): void;
  names_builder_build(names_builder: Pointer, maximum_iterations: number): Pointer;
  names_to_camel_case(names: Pointer, key: number): Pointer;
  names_to_pascal_case(names: Pointer, key: number): Pointer;
  names_to_snake_case(names: Pointer, key: number): Pointer;
  names_to_screaming_snake_case(names: Pointer, key: number): Pointer;
  names_free(names: Pointer): void;
}

//#endregion

//#region structures

export class PascalString {
  private constructor(private readonly pointer: Pointer) {}

  public static fromPointer(pointer: Pointer) {
    const instance = new PascalString(pointer);
    return instance;
  }

  public static fromString(value: string) {
    const metaPointer = wasmExports.alloc(2 * 4);
    assert(metaPointer > 0);

    const dataBytes = textEncoder.encode(value);
    const dataSize = dataBytes.length;
    const dataPointer = wasmExports.alloc(dataSize);
    assert(dataPointer > 0);
    getMemoryUint8().set(dataBytes, dataPointer);

    getMemoryView().setInt32(metaPointer + 0 * 4, dataSize, true);
    getMemoryView().setInt32(metaPointer + 1 * 4, dataPointer, true);

    const instance = new PascalString(metaPointer);
    return instance;
  }

  public toString() {
    const dataSize = getMemoryView().getInt32(this.pointer + 0 * 4, true);
    const dataPointer = getMemoryView().getInt32(this.pointer + 1 * 4, true);

    const slice = getMemoryUint8().slice(dataPointer, dataPointer + dataSize);
    const value = textDecoder.decode(slice, { stream: false });
    return value;
  }

  public asPointer() {
    return this.pointer;
  }

  [Symbol.dispose]() {
    const dataSize = getMemoryView().getInt32(this.pointer + 0 * 4, true);
    const dataPointer = getMemoryView().getInt32(this.pointer + 1 * 4, true);
    wasmExports.dealloc(dataPointer, dataSize);
    wasmExports.dealloc(this.pointer, 2 * 4);
  }
}

export class Out {
  private constructor(private readonly pointer: Pointer) {}

  public static createNullReference() {
    const pointer = wasmExports.alloc(1 * 4);
    assert(pointer > 0);
    getMemoryView().setInt32(pointer, 0, true);

    const instance = new Out(pointer);
    return instance;
  }

  public getReference() {
    const reference = getMemoryView().getInt32(this.pointer, true);
    return reference;
  }

  public asPointer() {
    return this.pointer;
  }

  [Symbol.dispose]() {
    wasmExports.dealloc(this.pointer, 1 * 4);
  }
}

//#endregion
