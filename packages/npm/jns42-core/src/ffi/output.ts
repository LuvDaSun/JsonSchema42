import { mainFfi } from "../main-ffi.js";

export class Output {
  public constructor(public readonly pointer: number) {
    //
  }
  public static create(value: number) {
    const pointer = createOutput(value);
    return new Output(pointer);
  }
  public read(): number {
    const { pointer } = this;
    return readOutput(pointer);
  }
  [Symbol.dispose]() {
    const { pointer } = this;
    return freeOutput(pointer);
  }
}

export function createOutput(value: number): number {
  const pointer = mainFfi.exports.alloc(4);
  mainFfi.memoryView.setUint32(pointer + 0, value, true);
  return pointer;
}

export function readOutput(pointer: number): number {
  const value = mainFfi.memoryView.getUint32(pointer);
  return value;
}

export function freeOutput(pointer: number) {
  mainFfi.exports.dealloc(pointer, 4);
}
