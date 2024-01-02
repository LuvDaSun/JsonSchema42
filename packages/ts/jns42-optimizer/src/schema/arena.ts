import { Arena, ArenaTransform } from "../utils/arena.js";
import { SchemaModel, isAlias } from "./model.js";

export type SchemaTransform = ArenaTransform<SchemaModel, SchemaArena>;

export class SchemaArena extends Arena<SchemaModel> {
  public resolveAlias(key: number): [number, SchemaModel] {
    let resolvedKey = key;
    let resolvedItem = this.getItem(resolvedKey);
    while (isAlias(resolvedItem)) {
      resolvedKey = resolvedItem.alias;
      resolvedItem = this.getItem(resolvedKey);
    }
    return [resolvedKey, resolvedItem];
  }
}
