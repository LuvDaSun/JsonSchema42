import assert from "assert";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export abstract class ForeignObject {
  /**
   * is this object disposed?
   */
  private disposed = false;
  /**
   * Is this object responsible for dropping it?
   */
  private responsible = true;

  constructor(public readonly pointer: Pointer) {
    //
  }

  /**
   * make the object not responsible for managing it's resources (dropping it)
   */
  public abandon() {
    this.responsible = false;
  }

  protected abstract drop(): void;

  [Symbol.dispose]() {
    assert.equal(this.disposed, false);
    if (this.responsible) {
      if (this.pointer !== NULL_POINTER) {
        this.drop();
      }
    }
    this.disposed = true;
  }
}
