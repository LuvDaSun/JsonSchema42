import assert from "assert";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export abstract class Wrapper {
  private disposed = false;
  private owned = true;

  constructor(public readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);
  }

  public letGo() {
    this.owned = false;
  }

  protected abstract drop(): void;

  [Symbol.dispose]() {
    assert.equal(this.disposed, false);
    if (this.owned) {
      this.drop();
    }
    this.disposed = true;
  }
}
