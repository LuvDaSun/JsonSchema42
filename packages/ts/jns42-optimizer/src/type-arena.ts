import * as types from "./types.js";
import { Arena, ArenaTransform } from "./utils/arena.js";

export type TypeArenaTransform = ArenaTransform<types.Union, TypeArena>;

export class TypeArena extends Arena<types.Union> {
  public getItemUnalias(index: number): Exclude<types.Union, types.Alias> {
    let item = this.getItem(index);
    while (item.type === "alias") {
      item = this.getItem(item.target);
    }
    return item;
  }
}
