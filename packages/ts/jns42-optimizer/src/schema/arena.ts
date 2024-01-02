import { Arena, ArenaTransform } from "../utils/arena.js";
import { SchemaAlias, SchemaModel } from "./model.js";

export type SchemaTransform = ArenaTransform<SchemaModel | SchemaAlias, SchemaArena>;

export class SchemaArena extends Arena<SchemaModel | SchemaAlias> {
  public resolveAlias(key: number): [number, SchemaModel] {
    let resolvedKey = key;
    let resolvedItem = this.getItem(resolvedKey);
    while ("alias" in resolvedItem) {
      resolvedKey = resolvedItem.alias;
      resolvedItem = this.getItem(resolvedKey);
    }
    return [resolvedKey, resolvedItem];
  }
}
