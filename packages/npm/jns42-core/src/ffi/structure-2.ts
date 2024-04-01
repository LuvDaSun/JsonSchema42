import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer, Size } from "../utils/index.js";

export class Structure2 {
  private static finalizationRegistry = new FinalizationRegistry<[Pointer, Size]>(
    ([pointer, size]) => {
      if (pointer !== NULL_POINTER) {
        mainFfi.exports.dealloc(pointer, size);
      }
    },
  );

  // keep track of being disposed, we an only dispose once
  private disposed = false;
  // keep track of being attached we can not detach when unattached
  // and we can not attach then already attached
  private attached = false;
  // token ro use to deregister the finalizationRegistry.
  private token = Symbol();

  public constructor(
    private pointer: Pointer,
    private size: Size,
  ) {
    if (pointer !== NULL_POINTER) {
      // if a pointer is provided, attach to the memory that the
      // pointer points to
      this.attach();
    }
  }

  [Symbol.dispose]() {
    // we can only dispose once!
    assert(!this.disposed);

    // this will eventually detach and deallocate
    this.setSize(0);
    this.disposed = true;
  }

  protected onAttach() {
    //
  }

  protected onDetach() {
    //
  }

  /**
   * Resize the memory that this structures occupies, this might
   * involve allocation, reallocation or deallocation
   * @param size the new size
   */
  protected setSize(size: Size) {
    if (this.pointer === NULL_POINTER) {
      // we have nothing allocated yet!
      if (size === 0) {
        // want to deallocate but already deallocated
      } else {
        this.allocate(size);
        this.attach();
      }
    } else {
      // already allocated, either reallocate or deallocate
      if (size === 0) {
        this.detach();
        this.deallocate();
      } else {
        if (size === this.size) {
          // already at the requested size
        } else {
          this.detach();
          this.reallocate(size);
          this.attach();
        }
      }
    }
  }
  public getSize() {
    return this.size;
  }

  public getPointer() {
    return this.pointer;
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

  private attach() {
    assert(!this.attached);
    this.onAttach();
    this.attached = true;

    // if someone forgets to cleanup, then the garbage collector will do it
    Structure2.finalizationRegistry.register(this, [this.pointer, this.size], this.token);
  }

  private detach() {
    // we don't need to clean up when detached
    Structure2.finalizationRegistry.unregister(this.token);

    assert(this.attached);
    this.onDetach();
    this.attached = false;
  }

  private allocate(size: number) {
    assert(this.pointer === NULL_POINTER);
    assert(size > 0);

    this.pointer = mainFfi.exports.alloc(size);
    this.size = size;
  }

  private reallocate(size: number) {
    assert(this.pointer !== NULL_POINTER);
    assert(this.size > 0);
    assert(size > 0);

    this.pointer = mainFfi.exports.realloc(this.pointer, this.size, size);
    this.size = size;
  }

  private deallocate() {
    assert(this.pointer !== NULL_POINTER);
    assert(this.size > 0);

    mainFfi.exports.dealloc(this.pointer, this.size);
    this.pointer = NULL_POINTER;
    // leave size for what it is
  }
}
