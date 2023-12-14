import * as types from "./types.js";
import { Arena, ArenaTransform } from "./utils/arena.js";

export type TypeArenaTransform = ArenaTransform<types.Base | types.Alias, TypeArena>;

export class TypeArena extends Arena<types.Base | types.Alias | types.Merge> {
  public resolveItem(key: number): types.Base {
    let item = this.getItem(key);
    while (item.type === "alias") {
      item = this.getItem(item.target);
    }
    return item;
  }

  public resolveKey(key: number): number {
    let item = this.getItem(key);
    while (item.type === "alias") {
      key = item.target;
      item = this.getItem(key);
    }
    return key;
  }
}
