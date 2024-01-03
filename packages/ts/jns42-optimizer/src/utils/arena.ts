export type ArenaTransform<T, A extends Arena<T> = Arena<T>> = (
  arena: A,
  item: T,
  key: number,
) => T;

export class Arena<T> {
  private items = new Array<T>();

  public *[Symbol.iterator]() {
    for (let index = 0; index < this.items.length; index++) {
      const item = this.items[index];
      yield [index, item] as const;
    }
  }

  public get size() {
    return this.items.length;
  }

  public getItem(key: number): T {
    return this.items[key];
  }

  public addItem(item: T): number {
    const key = this.items.length;
    this.items.push(item);
    return key;
  }

  public applyTransform(...transformers: ArenaTransform<T, typeof this>[]): number {
    let counter = 0;
    for (let index = 0; index < this.items.length; index++) {
      let item = this.items[index];
      for (const transform of transformers) {
        item = transform(this, item, index);
        if (item !== this.items[index]) {
          // console.group(`${transform.name}-${index}`);
          // console.log(this.items[index]);
          // console.log(item);
          // console.log();
          // console.groupEnd();
          counter++;
          this.items[index] = item;
        }
      }
    }
    return counter;
  }
}
