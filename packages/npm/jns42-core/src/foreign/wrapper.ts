import assert from "assert";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export abstract class ForeignObject {
  private disposed = false;
  private owned = true;

  constructor(public readonly pointer: Pointer) {
    //
  }

  public letGo() {
    this.owned = false;
  }

  protected abstract drop(): void;

  [Symbol.dispose]() {
    assert.equal(this.disposed, false);
    if (this.owned) {
      if (this.pointer !== NULL_POINTER) {
        this.drop();
      }
    }
    this.disposed = true;
  }
}
