export type ArenaTransform<T, A extends Arena<T> = Arena<T>> = (arena: A, item: T) => T;

export class Arena<T> {
  private items = new Array<T>();

  public [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }

  public get size() {
    return this.items.length;
  }

  public getItem(index: number): T {
    return this.items[index];
  }

  public addItem(item: T): number {
    const index = this.items.length;
    this.items.push(item);
    return index;
  }

  public applyTransform(transform: ArenaTransform<T, typeof this>): number {
    let counter = 0;
    for (let index = 0; index < this.items.length; index++) {
      const item = this.items[index];
      const itemNew = transform(this, item);
      if (item !== itemNew) {
        counter++;
        this.items[index] = itemNew;
      }
    }
    return counter;
  }
}
