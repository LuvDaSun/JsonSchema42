import * as types from "./types.js";
import { Arena, ArenaTransform } from "./utils/arena.js";

export type TypeArenaTransform = ArenaTransform<types.Item, TypeArena>;

export class TypeArena extends Arena<types.Item> {
  public resolveItem(key: number): types.Item {
    let item = this.getItem(key);
    while (types.isAlias(item)) {
      item = this.getItem(item.alias);
    }
    return item;
  }

  public resolveKey(key: number): number {
    let item = this.getItem(key);
    while (types.isAlias(item)) {
      key = item.alias;
      item = this.getItem(key);
    }
    return key;
  }
}
