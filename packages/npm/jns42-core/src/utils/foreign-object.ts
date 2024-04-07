import assert from "assert";

const finalizationRegistry = new FinalizationRegistry<() => void>((drop) => drop());

export abstract class ForeignObject {
  private token = {};

  /**
   * is this object disposed?
   */
  private disposed = false;
  /**
   * Is this object responsible for dropping it?
   */
  private responsible = true;

  constructor(
    public readonly pointer: number,
    private readonly drop: () => void,
  ) {
    assert(pointer !== 0);

    finalizationRegistry.register(this, drop, this.token);
  }

  /**
   * make the object not responsible for managing it's resources (dropping it)
   */
  public abandon() {
    this.responsible = false;
  }

  [Symbol.dispose]() {
    assert.equal(this.disposed, false);
    finalizationRegistry.unregister(this.token);
    if (this.responsible) {
      this.drop();
    }
    this.disposed = true;
  }
}
