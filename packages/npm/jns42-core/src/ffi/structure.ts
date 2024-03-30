import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer, Size } from "../utils/index.js";

export class Structure {
  private disposed = false;

  public readonly pointer: Pointer;
  public readonly size: Size;
  private owning = true;

  protected constructor(pointer: Pointer, size: Size) {
    assert(size > 0);
    this.size = size;
    if (pointer === NULL_POINTER) {
      this.pointer = this.allocate();
    } else {
      this.pointer = pointer;
    }
  }

  public release() {
    this.owning = false;
  }

  public acquire() {
    this.owning = true;
  }

  protected allocate() {
    return mainFfi.exports.alloc(this.size);
  }

  protected deallocate() {
    mainFfi.exports.dealloc(this.pointer, this.size);
  }

  protected setBytes(bytes: Uint8Array, offset = 0) {
    assert(offset + bytes.length <= this.size);
    mainFfi.memoryUint8.set(bytes, this.pointer + offset);
  }

  protected getBytes(offset = 0, size = this.size) {
    assert(offset + size <= this.size);
    return mainFfi.memoryUint8.slice(this.pointer + offset, this.pointer + offset + size);
  }

  protected setUint8(offset: number, value: number) {
    assert(offset <= this.size);
    mainFfi.memoryView.setUint8(this.pointer + offset, value);
  }

  protected getUint8(offset: number) {
    assert(offset <= this.size);
    return mainFfi.memoryView.getUint8(this.pointer + offset);
  }

  protected setInt8(offset: number, value: number) {
    assert(offset <= this.size);
    mainFfi.memoryView.setInt8(this.pointer + offset, value);
  }

  protected getInt8(offset: number) {
    assert(offset <= this.size);
    return mainFfi.memoryView.getInt8(this.pointer + offset);
  }

  protected setUint16(offset: number, value: number) {
    assert(offset <= this.size);
    mainFfi.memoryView.setUint16(this.pointer + offset, value, true);
  }

  protected getUint16(offset: number) {
    assert(offset <= this.size);
    return mainFfi.memoryView.getUint16(this.pointer + offset, true);
  }

  protected setInt16(offset: number, value: number) {
    assert(offset <= this.size);
    mainFfi.memoryView.setInt16(this.pointer + offset, value, true);
  }

  protected getInt16(offset: number) {
    assert(offset <= this.size);
    return mainFfi.memoryView.getInt16(this.pointer + offset, true);
  }

  protected setUint32(offset: number, value: number) {
    assert(offset <= this.size);
    mainFfi.memoryView.setUint32(this.pointer + offset, value, true);
  }

  protected getUint32(offset: number) {
    assert(offset <= this.size);
    return mainFfi.memoryView.getUint32(this.pointer + offset, true);
  }

  protected setInt32(offset: number, value: number) {
    assert(offset <= this.size);
    mainFfi.memoryView.setInt32(this.pointer + offset, value, true);
  }

  protected getInt32(offset: number) {
    assert(offset <= this.size);
    return mainFfi.memoryView.getInt32(this.pointer + offset, true);
  }

  [Symbol.dispose]() {
    assert(!this.disposed);
    if (this.owning) {
      if (this.size > 0) {
        this.deallocate();
      }
    }
    this.disposed = true;
  }
}
