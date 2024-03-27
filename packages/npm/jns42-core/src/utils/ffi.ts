import fs from "node:fs";

export type Size = number;
export type Pointer = number;

export const NULL_POINTER = 0;

export interface Exports {
  memory: WebAssembly.Memory;
}

export class Ffi<E extends Exports> {
  public readonly textEncoder = new TextEncoder();
  public readonly textDecoder = new TextDecoder("utf-8", {
    ignoreBOM: true,
    fatal: true,
  });

  public get exports() {
    return this.instance.exports as unknown as E;
  }

  private memoryUint8Cache?: Uint8Array;
  public get memoryUint8() {
    // if not defined or detached. For some reason (if the memory grows?) the array automatically detaches.
    if (this.memoryUint8Cache == null || this.memoryUint8Cache.buffer.byteLength === 0) {
      this.memoryUint8Cache = new Uint8Array(this.exports.memory.buffer);
    }
    return this.memoryUint8Cache;
  }

  private memoryViewCache?: DataView;
  public get memoryView() {
    // if not defined or detached. For some reason the view automatically detaches
    if (this.memoryViewCache == null || this.memoryViewCache.buffer.byteLength === 0) {
      this.memoryViewCache = new DataView(this.exports.memory.buffer);
    }
    return this.memoryViewCache;
  }

  public static fromFile<E extends Exports>(path: string) {
    const buffer = fs.readFileSync(path);
    return Ffi.fromBuffer<E>(buffer);
  }

  public static fromBuffer<E extends Exports>(buffer: BufferSource) {
    const module = new WebAssembly.Module(buffer);
    return Ffi.fromModule<E>(module);
  }

  public static fromModule<E extends Exports>(module: WebAssembly.Module) {
    const instance = new WebAssembly.Instance(module, {});
    return Ffi.fromInstance<E>(instance);
  }

  public static fromInstance<E extends Exports>(instance: WebAssembly.Instance) {
    return new Ffi<E>(instance);
  }

  private constructor(private readonly instance: WebAssembly.Instance) {
    //
  }
}
