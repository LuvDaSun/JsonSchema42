import * as types from "./types.js";
import { Arena, ArenaTransform } from "./utils/arena.js";

export type TypeArenaTransform = ArenaTransform<types.Union | types.Alias, TypeArena>;

export class TypeArena extends Arena<types.Union | types.Alias | types.Merge> {
  public getItemUnalias(key: number): types.Union {
    let item = this.getItem(key);
    while (item.type === "alias") {
      item = this.getItem(item.target);
    }
    return item;
  }
}
