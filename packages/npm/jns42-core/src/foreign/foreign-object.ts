import assert from "assert";

export abstract class ForeignObject {
  /**
   * is this object disposed?
   */
  private disposed = false;
  /**
   * Is this object responsible for dropping it?
   */
  private responsible = true;

  constructor(public readonly pointer: number) {
    assert(pointer !== 0);
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
      if (this.pointer !== 0) {
        this.drop();
      }
    }
    this.disposed = true;
  }
}
