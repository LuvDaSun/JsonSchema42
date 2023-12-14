import * as types from "./types.js";
import { Arena, ArenaTransform } from "./utils/arena.js";

export type TypeArenaTransform = ArenaTransform<types.Item | types.Alias, TypeArena>;

export class TypeArena extends Arena<types.Item | types.Alias | types.Merge> {
  public resolveItem(key: number): types.Item {
    let item = this.getItem(key);
    while (item.type === "alias") {
      item = this.getItem(item.alias);
    }
    return item;
  }

  public resolveKey(key: number): number {
    let item = this.getItem(key);
    while (item.type === "alias") {
      key = item.alias;
      item = this.getItem(key);
    }
    return key;
  }
}
