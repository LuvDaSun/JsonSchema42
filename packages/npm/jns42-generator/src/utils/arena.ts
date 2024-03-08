import immutable from "immutable";

export type ArenaTransform<T, A extends Arena<T> = Arena<T>> = (arena: A, key: number) => T;

export class Arena<T> {
  private items = immutable.List<T>();

  public [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }

  public get size() {
    return this.items.count();
  }

  public getItem(key: number): T {
    return this.items.get(key)!;
  }

  public setItem(key: number, item: T) {
    this.items = this.items.set(key, item);
  }

  public addItem(item: T): number {
    const key = this.items.count();
    this.items = this.items.push(item);
    return key;
  }

  public applyTransform(...transformers: ArenaTransform<T, typeof this>[]): number {
    let counter = 0;
    for (let key = 0; key < this.items.count(); key++) {
      for (const transform of transformers) {
        let itemsPrevious = this.items;
        transform(this, key);
        if (this.items !== itemsPrevious) {
          counter++;
        }
      }
    }
    return counter;
  }
}
